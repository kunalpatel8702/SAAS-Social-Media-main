const mongoose = require('mongoose');

const instagramAccountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    instagramId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    accessToken: {
        type: String,
        required: true
    },
    facebookPageId: {
        type: String
    },
    profilePicture: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const InstagramAccount = mongoose.model('InstagramAccount', instagramAccountSchema);

module.exports = InstagramAccount;
