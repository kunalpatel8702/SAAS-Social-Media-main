const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: String,
    features: [String],
    price: {
        type: Number,
        default: 0
    },
    originalDescription: String,
    aiGeneratedDescription: String,
    seoKeywords: [String],
    images: [String],
    isPublished: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
