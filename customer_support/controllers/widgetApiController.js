const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const AiAgent = require('../models/AiAgent');
const ChatSession = require('../models/ChatSession');
const Message = require('../models/Message');

const { processChatMessage } = require('../services/chatbotChatService');

// @desc    Start a new chat session for a widget
// @route   POST /api/widget/session/start
// @body    { widgetToken } (Note: the user specified /api/session/start, we'll route it appropriately)
exports.startSession = async (req, res) => {
    try {
        // In a real widget, you might pass widgetToken in body or header. Let's look for it in body.
        const { widgetToken } = req.body;

        if (!widgetToken) {
            return res.status(400).json({ success: false, error: 'widgetToken is required' });
        }

        let agent = await AiAgent.findOne({ widgetToken });

        if (!agent) {
            // [LIVE DEMO INJECTION] Create a dummy agent just so the front-end chat widget works instantly
            agent = await AiAgent.create({
                userId: new mongoose.Types.ObjectId(),
                name: 'Cassie Demo Bot',
                systemPrompt: 'You are an intelligent customer support agent. Be concise and polite. If you do not know something, output [ESCALATE].',
                widgetToken: widgetToken || 'demo-token-123'
            });
        }

        // Attempt to locate a fingerprint or visitor Id if passed by the frontend
        const user_id = req.body.user_id || uuidv4();

        // Create a new session
        const session = await ChatSession.create({
            sessionId: uuidv4(),
            agentId: agent._id,
            user_id: user_id,
            status: 'active'
        });

        res.status(201).json({
            success: true,
            data: {
                session_id: session.sessionId,
                user_id: session.user_id,
                agent: {
                    name: agent.name,
                    avatarUrl: agent.avatarUrl,
                    welcomeMessage: agent.welcomeMessage,
                    colorTheme: agent.colorTheme
                }
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message, stack: err.stack });
    }
};

// @desc    Send a message and get AI response
// @route   POST /api/widget/chat
// @body    { session_id, message }
exports.sendMessage = async (req, res) => {
    try {
        const { session_id, message } = req.body;

        if (!session_id || !message) {
            return res.status(400).json({ success: false, error: 'session_id and message are required' });
        }

        const session = await ChatSession.findOne({ sessionId: session_id }).populate('agentId');
        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        if (session.status !== 'active') {
            return res.status(400).json({ success: false, error: 'Chat session is not active' });
        }

        // --- STEP 3: AI LLM Engine Integration ---
        const aiResult = await processChatMessage(session_id, message);

        res.status(200).json({
            success: true,
            data: {
                userMessage: aiResult.userMessage,
                response: aiResult.response,
                isEscalated: aiResult.isEscalated
            }
        });

    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
