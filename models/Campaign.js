const mongoose = require('mongoose');
const { CampaignModuleType, CampaignStatus } = require('../src/config/enums');

const campaignSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
    },
    customPrompt: {
        type: String,
        default: null,
    },
    emailConfig: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    aiCallConfig: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    moduleType: {
        type: String,
        enum: Object.values(CampaignModuleType),
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(CampaignStatus),
        default: CampaignStatus.DRAFT,
    },
    totalItems: {
        type: Number,
        default: 0,
    },
    processedItems: {
        type: Number,
        default: 0,
    },
    successCount: {
        type: Number,
        default: 0,
    },
    failureCount: {
        type: Number,
        default: 0,
    },
    openedCount: {
        type: Number,
        default: 0,
    },
    clickedCount: {
        type: Number,
        default: 0,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

campaignSchema.index({ ownerId: 1, status: 1 });

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
