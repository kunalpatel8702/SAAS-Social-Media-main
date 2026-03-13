const mongoose = require('mongoose');
const { CampaignItemStatus } = require('../src/config/enums');

const campaignItemSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
        index: true,
    },
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true,
        index: true,
    },
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: Object.values(CampaignItemStatus),
        default: CampaignItemStatus.PENDING,
    },
    attemptCount: {
        type: Number,
        default: 0,
    },
    externalRefId: {
        type: String,
        default: null,
    },
    isOpened: {
        type: Boolean,
        default: false,
    },
    isClicked: {
        type: Boolean,
        default: false,
    },
    result: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    lastAttemptAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

// Unique constraint: one lead per campaign
campaignItemSchema.index({ campaignId: 1, leadId: 1 }, { unique: true });
campaignItemSchema.index({ ownerId: 1, campaignId: 1 });
campaignItemSchema.index({ ownerId: 1, status: 1 });

const CampaignItem = mongoose.model('CampaignItem', campaignItemSchema);

module.exports = CampaignItem;
