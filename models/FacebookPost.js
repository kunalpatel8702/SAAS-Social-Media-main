const mongoose = require('mongoose');

const facebookPostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    facebookAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    platform: {
        type: String,
        enum: ['facebook'],
        default: 'facebook'
    },
    caption: {
        type: String,
        required: [true, 'Please provide a caption']
    },
    mediaUrl: {
        type: String,
        required: [true, 'Please provide a media URL (image or video)']
    },
    mediaType: {
        type: String,
        enum: ['IMAGE', 'VIDEO', 'REELS'],
        default: 'IMAGE'
    },
    scheduledAt: {
        type: Date,
        required: [true, 'Please provide a scheduled time']
    },
    status: {
        type: String,
        enum: ['pending', 'scheduled', 'posted', 'failed'],
        default: 'pending'
    },
    facebookPostId: {
        type: String
    },
    errorMessage: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const FacebookPost = mongoose.model('FacebookPost', facebookPostSchema);

module.exports = FacebookPost;
