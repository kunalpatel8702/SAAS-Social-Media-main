const mongoose = require('mongoose');
const { LeadSource, LeadStatus } = require('../src/config/enums');

const leadSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
        index: true,
    },
    category: {
        type: String,
        default: null,
    },
    companyName: {
        type: String,
        default: null,
    },
    contactName: {
        type: String,
        default: null,
    },
    phone: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        default: null,
    },
    website: {
        type: String,
        default: null,
    },
    facebook: {
        type: String,
        default: null,
    },
    linkedin: {
        type: String,
        default: null,
    },
    instagram: {
        type: String,
        default: null,
    },
    source: {
        type: String,
        enum: Object.values(LeadSource),
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(LeadStatus),
        default: LeadStatus.NEW,
    },
    rawData: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    lastContactedAt: {
        type: Date,
        default: null,
    },
    score: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
        index: true,
    },
    scoreInsights: {
        type: String,
        default: null,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

// Compound indexes for efficient queries
leadSchema.index({ ownerId: 1, status: 1 });
leadSchema.index({ ownerId: 1, website: 1 });
leadSchema.index({ ownerId: 1, phone: 1 });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
