const express = require('express');
const router = express.Router();
const ec = require('../controllers/ecommerceController');
const { protect } = require('../../../controllers/authController');

// ── Store CRUD ──────────────────────────────────────────
router.post('/store',                protect, ec.createStore);
router.get('/stores',                protect, ec.getMyStores);
router.get('/store/:storeId',        protect, ec.getStoreById);
router.put('/store/:storeId',        protect, ec.updateStore);

// ── Product CRUD ────────────────────────────────────────
router.post('/store/:storeId/product',  protect, ec.addProduct);
router.get('/store/:storeId/products',  protect, ec.getProducts);

// ── Review CRUD ─────────────────────────────────────────
router.post('/store/:storeId/review',                protect, ec.addReview);
router.get('/product/:productId/reviews',            protect, ec.getReviews);

// ── AI Generators ───────────────────────────────────────
router.post('/ai/product-description',  protect, ec.generateProductDescription);
router.post('/ai/landing-page',         protect, ec.generateLandingPage);
router.post('/ai/marketing-copy',       protect, ec.generateMarketingCopy);
router.post('/ai/support-response',     protect, ec.generateSupportResponse);

// ── AI Analysis ─────────────────────────────────────────
router.get('/ai/review-analysis/:productId', protect, ec.analyzeReviews);
router.get('/ai/store-audit/:storeId',       protect, ec.getStoreOptimization);
router.get('/ai/insights/:storeId',          protect, ec.getSalesInsights);

// ── Autonomous AI Agent Hub ─────────────────────────────
const autonomousRoutes = require('./autonomousRoutes');
router.use('/ai/autonomous', autonomousRoutes);

module.exports = router;
