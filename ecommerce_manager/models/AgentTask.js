const mongoose = require('mongoose');

const AgentTaskSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        index: true
    },
    signalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusinessSignal'
    },
    agentRole: {
        type: String,
        enum: ['marketing', 'pricing', 'inventory', 'customer_support', 'analytics', 'supervisor', 'operations', 'competitor', 'growth', 'security'],
        required: true
    },
    title: String,
    planDescription: String,
    // Steps required to execute the action
    steps: [{
        action: String, // e.g., 'update_price', 'send_email'
        params: Object,
        status: {
            type: String,
            enum: ['pending', 'executing', 'completed', 'failed'],
            default: 'pending'
        },
        result: Object,
        error: String
    }],
    status: {
        type: String,
        enum: ['planned', 'awaiting_approval', 'executing', 'completed', 'failed', 'cancelled'],
        default: 'planned'
    },
    requiresApproval: {
        type: Boolean,
        default: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,
    completedAt: Date,
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    }
}, { timestamps: true });

module.exports = mongoose.model('AgentTask', AgentTaskSchema);
