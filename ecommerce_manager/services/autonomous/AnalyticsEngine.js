const Product = require('../../models/Product');
const Review = require('../../models/Review');
// In a full system, we'd have Order models here
// const Order = require('../models/Order');

class AnalyticsEngine {
    /**
     * Compute a full health check for a store
     */
    async calculateStoreHealth(storeId) {
        try {
            // 1. Gather raw data metrics
            const mongoose = require('mongoose');
            const productCount = await Product.countDocuments({ storeId });
            
            // Fix: Added 'new' keyword and used correct path for ObjectId
            const reviewStats = await Review.aggregate([
                { $match: { storeId: new mongoose.Types.ObjectId(storeId) } },
                { $group: { _id: null, avgRating: { $avg: '$rating' } } }
            ]);

            const totalReviews = await Review.countDocuments({ storeId });
            const avgRating = reviewStats[0]?.avgRating || 0;

            // 2. Mock financial data (In production, pull from Orders/Stripe)
            const revenueCurrentMonth = 15000;
            const revenueLastMonth = 18500;
            const revenueGrowth = ((revenueCurrentMonth - revenueLastMonth) / revenueLastMonth) * 100;

            // 3. Detect Anomalies
            const anomalies = [];
            if (revenueGrowth < -15) {
                anomalies.push({
                    type: 'REVENUE_DROP',
                    severity: 'high',
                    description: `Revenue is down ${Math.abs(revenueGrowth).toFixed(1)}% compared to last month.`
                });
            }

            if (avgRating < 3.5 && totalReviews > 5) {
                anomalies.push({
                    type: 'NEGATIVE_REVIEW_SPIKE',
                    severity: 'medium',
                    description: `Average rating has dropped to ${avgRating.toFixed(1)}.`
                });
            }

            return {
                timestamp: new Date(),
                metrics: {
                    revenue: revenueCurrentMonth,
                    growth: revenueGrowth,
                    avgRating,
                    totalProducts: productCount
                },
                anomalies
            };
        } catch (error) {
            console.error('[AnalyticsEngine] Health calculation failed:', error.message);
            throw error;
        }
    }
}

module.exports = new AnalyticsEngine();
