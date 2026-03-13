const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
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
    videoUrl: {
        type: String
    },
    voiceId: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['queued', 'rendering', 'done', 'failed', 'deleted'],
        default: 'queued'
    },
    thumbnailUrl: {
        type: String
    },
    scenes: [
        {
            text: String,
            type: { type: String }
        }
    ],
    metadata: {
        duration: Number,
        aspectRatio: { type: String, default: '9:16' }
    },
    duration: {
        type: Number,
        default: 30
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

module.exports = mongoose.model('Video', VideoSchema);
