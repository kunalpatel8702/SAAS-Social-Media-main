const mongoose = require('mongoose');

const IntegrationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    provider: {
        type: String,
        enum: ['shopify', 'woocommerce', 'stripe', 'meta-ads', 'google-ads', 'klaviyo', 'mailchimp'],
        required: true
    },
    status: {
        type: String,
        enum: ['connected', 'disconnected', 'error', 'pending'],
        default: 'pending'
    },
    // Credentials stored securely (In production, these should be encrypted)
    credentials: {
        apiKey: String,
        apiSecret: String,
        accessToken: String,
        shopUrl: String,
        webhookSecret: String,
        accountId: String // For Ads/Stripe
    },
    scopes: [String],
    lastSyncedAt: Date,
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Ensure a user can only have one active integration per provider per store
IntegrationSchema.index({ storeId: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Integration', IntegrationSchema);
