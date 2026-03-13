const mongoose = require('mongoose');

const aiAgentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        default: 'Customer Support Assistant'
    },
    avatarUrl: {
        type: String,
        default: ''
    },
    welcomeMessage: {
        type: String,
        default: 'Hi there! How can I help you today?'
    },
    colorTheme: {
        type: String,
        default: '#000000'
    },
    systemPrompt: {
        type: String,
        default: 'You are a professional customer support assistant. Answer questions based ONLY on the provided knowledge base.'
    },
    allowedDomains: [{
        type: String
    }],
    widgetToken: {
        type: String,
        required: true,
        unique: true,
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model('AiAgent', aiAgentSchema);
