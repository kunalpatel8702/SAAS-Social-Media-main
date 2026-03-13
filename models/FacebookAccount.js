const mongoose = require('mongoose');

const facebookAccountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    facebookId: {
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
        type: String,
        required: true
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

const FacebookAccount = mongoose.model('FacebookAccount', facebookAccountSchema);

module.exports = FacebookAccount;
