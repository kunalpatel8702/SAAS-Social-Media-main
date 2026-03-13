const mongoose = require('mongoose');

const landingPageSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        index: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        index: true
    },
    slug: {
        type: String,
        unique: true,
        sparse: true
    },
    content: {
        hero: {
            headline: String,
            subheadline: String,
            cta: String
        },
        benefits: [{
            title: String,
            description: String,
            icon: String
        }],
        features: [{
            title: String,
            description: String
        }],
        testimonials: [{
            author: String,
            text: String,
            avatar: String
        }],
        finalCTA: {
            title: String,
            subtext: String,
            buttonText: String
        }
    },
    designToken: {
        type: String,
        default: 'modern-dark'
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    }
}, { timestamps: true });

module.exports = mongoose.model('LandingPage', landingPageSchema);
