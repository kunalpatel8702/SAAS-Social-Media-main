const ChatSession = require('../models/ChatSession');
const Message = require('../models/Message');
const SupportTicket = require('../models/SupportTicket');

exports.getAllSessions = async (req, res) => {
    try {
        const sessions = await ChatSession.find()
            .sort({ start_time: -1 })
            .limit(50); // Fetch top 50 recent sessions

        res.status(200).json({ success: true, data: sessions });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getSessionMessages = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const messages = await Message.find({ sessionId }).sort({ timestamp: 1 });
        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.sendHumanMessage = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { text } = req.body;

        const { v4: uuidv4 } = require('uuid');

        const newMessage = await Message.create({
            message_id: uuidv4(),
            sessionId,
            sender_type: 'human', // The admin is speaking directly to the user
            message_text: text
        });

        res.status(201).json({ success: true, data: newMessage });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find().sort({ created_at: -1 });
        res.status(200).json({ success: true, data: tickets });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
