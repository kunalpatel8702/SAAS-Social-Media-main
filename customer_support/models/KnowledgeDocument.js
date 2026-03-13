const mongoose = require('mongoose');

const knowledgeDocumentSchema = new mongoose.Schema({
    document_id: {
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
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    embedding_vector: {
        type: [Number], // Array of floats for Vector representations
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('KnowledgeDocument', knowledgeDocumentSchema);
