const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        trim: true
    },
    niche: String,
    brandVoice: {
        type: String,
        enum: ['Professional', 'Playful', 'Luxury', 'Minimalist', 'Friendly'],
        default: 'Professional'
    },
    industry: String,
    settings: {
        currency: { type: String, default: 'USD' },
        supportEmail: String,
        returnPolicy: String,
        shippingInfo: String,
        timezone: { type: String, default: 'UTC' }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);
