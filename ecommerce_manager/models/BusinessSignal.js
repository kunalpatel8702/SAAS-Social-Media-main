const mongoose = require('mongoose');

const BusinessSignalSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        index: true
    },
    integrationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Integration'
    },
    // The type of business event detected
    type: {
        type: String,
        enum: [
            'ORDER_CREATED', 
            'ABANDONED_CART', 
            'LOW_STOCK', 
            'NEGATIVE_REVIEW', 
            'REVENUE_DROP', 
            'COMPETITOR_PRICE_CHANGE',
            'AD_ROI_LOW'
        ],
        required: true,
        index: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    },
    // Raw data from the source (Shopify JSON, etc.)
    payload: {
        type: Object,
        required: true
    },
    // AI's interpretation of the signal
    aiInterpretation: {
        summary: String,
        recommendedAction: String,
        confidence: Number
    },
    isProcessed: {
        type: Boolean,
        default: false
    },
    processedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('BusinessSignal', BusinessSignalSchema);
