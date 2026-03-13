const Store = require('../models/Store');
const Product = require('../models/Product');
const Review = require('../models/Review');
const LandingPage = require('../models/LandingPage');
const MarketingCampaign = require('../models/MarketingCampaign');
const SalesInsight = require('../models/SalesInsight');
const EcommerceAIService = require('../services/EcommerceAIService');
const mongoose = require('mongoose');

// ──────────────────────────────────────────────────────────────
//  STORE CRUD
// ──────────────────────────────────────────────────────────────

exports.createStore = async (req, res) => {
    try {
        const store = new Store({ userId: req.user.id, ...req.body });
        await store.save();
        res.status(201).json({ success: true, data: store });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getMyStores = async (req, res) => {
    try {
        const stores = await Store.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, data: stores });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getStoreById = async (req, res) => {
    try {
        const store = await Store.findOne({ _id: req.params.storeId, userId: req.user.id });
        if (!store) return res.status(404).json({ success: false, error: 'Store not found' });
        res.json({ success: true, data: store });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateStore = async (req, res) => {
    try {
        const store = await Store.findOneAndUpdate(
            { _id: req.params.storeId, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!store) return res.status(404).json({ success: false, error: 'Store not found' });
        res.json({ success: true, data: store });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ──────────────────────────────────────────────────────────────
//  PRODUCT CRUD
// ──────────────────────────────────────────────────────────────

exports.addProduct = async (req, res) => {
    try {
        const product = new Product({ storeId: req.params.storeId, ...req.body });
        await product.save();
        res.status(201).json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({ storeId: req.params.storeId }).sort({ createdAt: -1 });
        res.json({ success: true, data: products });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ──────────────────────────────────────────────────────────────
//  REVIEW CRUD
// ──────────────────────────────────────────────────────────────

exports.addReview = async (req, res) => {
    try {
        const review = new Review({ storeId: req.params.storeId, ...req.body });
        await review.save();
        res.status(201).json({ success: true, data: review });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
        res.json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ──────────────────────────────────────────────────────────────
//  AI GENERATORS
// ──────────────────────────────────────────────────────────────

exports.generateProductDescription = async (req, res) => {
    try {
        const { name, category, features, brandVoice } = req.body;
        if (!name) return res.status(400).json({ success: false, error: 'Product name is required' });
        const result = await EcommerceAIService.generateProductDescription({ name, category, features, brandVoice });
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.generateLandingPage = async (req, res) => {
    try {
        const { productId, goal, targetAudience } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

        const result = await EcommerceAIService.generateLandingPage({
            productName: product.name,
            productDescription: product.aiGeneratedDescription || product.originalDescription || '',
            targetAudience,
            goal
        });

        const page = new LandingPage({
            storeId: product.storeId,
            productId,
            content: result
        });
        await page.save();

        res.json({ success: true, data: page });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.generateMarketingCopy = async (req, res) => {
    try {
        const { type, productInfo, campaignGoal, targetAudience, storeId } = req.body;
        if (!type || !productInfo) {
            return res.status(400).json({ success: false, error: 'type and productInfo are required' });
        }

        const result = await EcommerceAIService.generateMarketingCopy({ type, productInfo, campaignGoal, targetAudience });

        const campaign = new MarketingCampaign({
            storeId,
            type,
            title: result.headline || 'Untitled Campaign',
            content: result.body || JSON.stringify(result),
            targetAudience,
            campaignGoal
        });
        await campaign.save();

        res.json({ success: true, data: { generated: result, campaign } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.generateSupportResponse = async (req, res) => {
    try {
        const { message, storeId } = req.body;
        const store = await Store.findById(storeId);
        if (!store) return res.status(404).json({ success: false, error: 'Store not found' });

        const result = await EcommerceAIService.generateSupportResponse({
            message,
            storeContext: store.settings || {}
        });
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ──────────────────────────────────────────────────────────────
//  ANALYSIS
// ──────────────────────────────────────────────────────────────

exports.analyzeReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId });
        if (!reviews.length) return res.status(404).json({ success: false, error: 'No reviews found' });
        const analysis = await EcommerceAIService.analyzeReviews(reviews);
        res.json({ success: true, data: analysis });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getStoreOptimization = async (req, res) => {
    try {
        const store = await Store.findOne({ _id: req.params.storeId, userId: req.user.id });
        if (!store) return res.status(404).json({ success: false, error: 'Store not found' });

        const products = await Product.find({ storeId: store._id }).limit(5);
        const productSample = products.map(p => p.name).join(', ');

        const result = await EcommerceAIService.getStoreOptimization({
            name: store.name,
            niche: store.niche,
            brandVoice: store.brandVoice,
            industry: store.industry,
            productSample
        });
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getSalesInsights = async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const totalProducts = await Product.countDocuments({ storeId });
        const totalReviews = await Review.countDocuments({ storeId });

        const ratingAgg = await Review.aggregate([
            { $match: { storeId: new mongoose.Types.ObjectId(storeId) } },
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);
        const avgRating = ratingAgg[0]?.avgRating?.toFixed(1) || '0.0';

        const topProducts = await Product.find({ storeId }).sort({ createdAt: -1 }).limit(3);
        const topProductNames = topProducts.map(p => p.name);

        const aiInsights = await EcommerceAIService.generateSalesInsights({
            totalProducts,
            totalReviews,
            avgRating,
            topProductNames
        });

        const insight = new SalesInsight({
            storeId,
            metrics: { totalProducts, totalReviews, avgRating: parseFloat(avgRating), topProducts: topProducts.map(p => p._id) },
            aiSuggestions: aiInsights.insights || []
        });
        await insight.save();

        res.json({ success: true, data: { metrics: insight.metrics, aiInsights } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
