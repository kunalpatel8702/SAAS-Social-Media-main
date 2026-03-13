const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AiAgent',
        required: true,
        index: true
    },
    user_id: {
        type: String, // Can be an external visitor fingerprint or simple ID
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['active', 'resolved', 'escalated'],
        default: 'active'
    },
    start_time: {
        type: Date,
        default: Date.now
    },
    end_time: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
