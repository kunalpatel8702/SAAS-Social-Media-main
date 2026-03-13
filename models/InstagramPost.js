const mongoose = require('mongoose');

const instagramPostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    instagramAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstagramAccount',
        required: true
    },
    caption: {
        type: String,
        required: [true, 'Please provide a caption']
    },
    mediaUrl: {
        type: String,
        required: [true, 'Please provide a media URL']
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
    instagramPostId: {
        type: String
    },
    errorMessage: {
        type: String
    },
    price: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        default: 'General'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, { timestamps: true });

const InstagramPost = mongoose.model('InstagramPost', instagramPostSchema);

module.exports = InstagramPost;
