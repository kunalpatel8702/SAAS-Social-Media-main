const mongoose = require('mongoose');

const twitterPostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    twitterAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TwitterAccount',
        required: true
    },
    text: {
        type: String,
        required: [true, 'Please provide a text for the post']
    },
    mediaUrl: {
        type: String
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
    twitterPostId: {
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

const TwitterPost = mongoose.model('TwitterPost', twitterPostSchema);

module.exports = TwitterPost;
