const mongoose = require('mongoose');

const salesInsightSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        index: true
    },
    period: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
    },
    metrics: {
        totalProducts: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
        avgRating: { type: Number, default: 0 },
        sentimentBreakdown: {
            positive: { type: Number, default: 0 },
            neutral: { type: Number, default: 0 },
            negative: { type: Number, default: 0 }
        },
        topProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
    },
    aiSuggestions: [String],
    generatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('SalesInsight', salesInsightSchema);
