const mongoose = require('mongoose');

const userSubscriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AutomationService",
            required: true,
        },

        startDate: {
            type: Date,
            default: Date.now,
        },

        endDate: {
            type: Date,
        },

        paymentId: {
            type: String,
        },

        amountPaid: {
            type: Number,
        },

        currency: {
            type: String,
            default: "INR",
        },

        status: {
            type: String,
            enum: ["pending", "active", "expired", "cancelled"],
            default: "active",
        },

        isActive: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("UserSubscription", userSubscriptionSchema);