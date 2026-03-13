const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    ticket_id: {
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
        type: String, // Chat visitor ID
        required: true
    },
    issue_description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'closed'],
        default: 'open'
    },
    resolved_at: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
