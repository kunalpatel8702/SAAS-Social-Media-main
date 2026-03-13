const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession', required: true, index: true },
    sender_type: {
        type: String,
        enum: ['user', 'ai', 'human'],
        required: true
    },
    message_text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
