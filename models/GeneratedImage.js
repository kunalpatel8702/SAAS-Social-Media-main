const mongoose = require('mongoose');

const GeneratedImageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    prompt: {
        type: String,
        required: true
    },
    renderId: {
        type: String,
        required: true,
        unique: true
    },
    imageUrl: {
        type: String
    },
    status: {
        type: String,
        enum: ['queued', 'generating', 'done', 'failed', 'deleted'],
        default: 'queued'
    },
    metadata: {
        aspectRatio: { type: String, default: '1:1' },
        width: Number,
        height: Number
    },
    isActive: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GeneratedImage', GeneratedImageSchema);
