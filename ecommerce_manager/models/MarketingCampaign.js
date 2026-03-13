const mongoose = require('mongoose');

const marketingCampaignSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['email', 'facebook-ad', 'instagram-post', 'google-ad', 'product-launch', 'social-caption'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    targetAudience: String,
    campaignGoal: {
        type: String,
        enum: ['drive-sales', 'product-awareness', 'customer-retention', 'feedback-gathering'],
        default: 'drive-sales'
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'sent', 'archived'],
        default: 'draft'
    }
}, { timestamps: true });

module.exports = mongoose.model('MarketingCampaign', marketingCampaignSchema);
