const mongoose = require('mongoose');

const linkedinAccountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    linkedinId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    accessToken: {
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

const LinkedinAccount = mongoose.model('LinkedinAccount', linkedinAccountSchema);

module.exports = LinkedinAccount;
