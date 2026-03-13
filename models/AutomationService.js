const mongoose = require('mongoose');

const automationServiceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        description: {
            type: String,
        },


        price: {
            type: Number,
            required: true,
        },

        currency: {
            type: String,
            default: "INR",
        },

        billingCycle: {
            type: String,
            enum: ["monthly", "quarterly", "yearly"],
            default: "monthly",
        },

        durationInDays: {
            type: Number,
            default: 30,
        },

        webhookUrl: {
            type: String,
            // n8n or automation endpoint
        },

        apiKeyRequired: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        priceINR: {
            type: Number,
            default: 0,
        },

        priceUSD: {
            type: Number,
            default: 0,
        },

        detailedDescription: {
            type: String,
        },

        benefits: [
            {
                type: String,
            }
        ],

        howItWorks: {
            type: String,
        },

        targetAudience: {
            type: String,
        },

        maxUsageLimit: {
            type: Number,
            default: 0, // 0 = unlimited
        },

        features: [
            {
                type: String,
            }
        ],

        icon: {
            type: String,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("AutomationService", automationServiceSchema);