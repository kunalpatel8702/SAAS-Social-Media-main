const { v4: uuidv4 } = require('uuid');
const SupportTicket = require('../models/SupportTicket');
const AiAgent = require('../models/AiAgent');

// @desc    Create a new support ticket (Manual user escalation or admin creation)
// @route   POST /api/ticket/create
// @body    { agentId, user_id, issue_description }
exports.createTicket = async (req, res) => {
    try {
        const { agentId, user_id, issue_description } = req.body;

        if (!agentId || !user_id || !issue_description) {
            return res.status(400).json({ success: false, error: 'agentId, user_id, and issue_description are required' });
        }

        const agent = await AiAgent.findById(agentId);
        if (!agent) {
            return res.status(404).json({ success: false, error: 'Agent not found' });
        }

        const ticket = await SupportTicket.create({
            ticket_id: uuidv4(),
            agentId: agent._id,
            user_id: user_id,
            issue_description: issue_description,
            status: 'open'
        });

        res.status(201).json({
            success: true,
            data: ticket
        });

    } catch (err) {
        console.error('Error creating ticket:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get support analytics for a specific AI agent
// @route   GET /api/admin/analytics?agentId=...
// @access  Private (Needs SaaS User Auth in prod)
exports.getAnalytics = async (req, res) => {
    try {
        const { agentId } = req.query;
        if (!agentId) return res.status(400).json({ error: 'agentId query parameter is required' });

        // 1. Total Queries (Total Sessions or Total Messages)
        const ChatSession = require('../models/ChatSession');
        const Message = require('../models/Message');

        const totalSessions = await ChatSession.countDocuments({ agentId });

        // Total messages exchanged in those sessions
        const sessions = await ChatSession.find({ agentId }).select('_id');
        const sessionIds = sessions.map(s => s._id);
        const totalMessages = await Message.countDocuments({ session_id: { $in: sessionIds } });

        // 2. Ticket Resolution Rates
        const totalTickets = await SupportTicket.countDocuments({ agentId });
        const resolvedTickets = await SupportTicket.countDocuments({ agentId, status: 'closed' });
        const resolutionRate = totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(2) + '%' : 'N/A';

        res.status(200).json({
            success: true,
            data: {
                totalSessions,
                totalMessages,
                tickets: {
                    total: totalTickets,
                    resolved: resolvedTickets,
                    resolutionRate
                }
            }
        });

    } catch (err) {
        console.error('Error fetching analytics:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
