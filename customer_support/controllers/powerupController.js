const Groq = require('groq-sdk');
const KnowledgeDocument = require('../models/KnowledgeDocument');
const ChatSession = require('../models/ChatSession');
const Message = require('../models/Message');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// @desc    Generate a Support Report based on recent chats
// @route   POST /api/powerups/analyze-feedback
// @body    { agentId }
exports.analyzeFeedback = async (req, res) => {
    try {
        const { agentId } = req.body;
        if (!agentId) return res.status(400).json({ error: 'agentId required' });

        // Fetch recent 50 messages to summarize
        // In reality, you'd fetch sessions for this agent, then their messages.
        // For MVP blueprint, let's just make the Groq call directly.

        res.status(200).json({
            success: true,
            data: "Feedback analysis logic would aggregate recent messages and use LLM to summarize."
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Automatically Generate FAQs from Knowledge Base
// @route   POST /api/powerups/generate-faq
// @body    { agentId }
exports.generateFaq = async (req, res) => {
    try {
        const { agentId } = req.body;
        if (!agentId) return res.status(400).json({ error: 'agentId required' });

        // 1. Fetch all knowledge docs for this agent
        const docs = await KnowledgeDocument.find({ agentId });
        if (docs.length === 0) {
            return res.status(400).json({ error: 'No knowledge documents found to generate FAQ from.' });
        }

        const compiledText = docs.map(d => d.content).join('\n\n').substring(0, 5000); // Truncate to save tokens

        // 2. Ask Groq to generate FAQs
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are an expert technical writer. Read the following knowledge base and generate a list of 5 Frequently Asked Questions with clear, concise answers.' },
                { role: 'user', content: compiledText }
            ],
            model: 'llama3-8b-8192',
            temperature: 0.5,
        });

        const faqContent = chatCompletion.choices[0]?.message?.content || 'Could not generate FAQ.';

        res.status(200).json({
            success: true,
            data: faqContent
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Draft a response to a custom email or comment
// @route   POST /api/powerups/draft-response
// @body    { agentId, customerQuery, channel }
exports.draftResponse = async (req, res) => {
    try {
        const { agentId, customerQuery, channel } = req.body;
        if (!agentId || !customerQuery) return res.status(400).json({ error: 'agentId and customerQuery required' });

        // Integrate RAG here just like in the chat service!
        const { retrieveContextForQuery } = require('../services/agentBrainService');
        const ragContext = await retrieveContextForQuery(agentId, customerQuery);

        const systemPrompt = `You are an expert customer support agent drafting a perfect, polite response for a ${channel || 'email'}. 
Use the following context to answer accurately: ${ragContext}`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: customerQuery }
            ],
            model: 'llama3-8b-8192',
            temperature: 0.4,
        });

        res.status(200).json({
            success: true,
            data: chatCompletion.choices[0]?.message?.content || 'Could not draft response.'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
