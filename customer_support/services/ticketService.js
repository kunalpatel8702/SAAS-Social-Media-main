const SupportTicket = require('../models/SupportTicket');
const ChatSession = require('../models/ChatSession');
const { v4: uuidv4 } = require('uuid');

/**
 * Creates a support ticket and notifies the human agents.
 */
exports.createTicketAndEscalate = async (sessionId, agentId, userId, issueDescription) => {
    try {
        // 1. Create the Support Ticket
        const newTicket = await SupportTicket.create({
            ticket_id: uuidv4(),
            agentId: agentId,
            user_id: userId,
            sessionId: sessionId, // Assuming sessionId is the ObjectId of the ChatSession
            issue_description: issueDescription,
            status: 'open'
        });

        // 2. Update the Chat Session status to escalated
        await ChatSession.findByIdAndUpdate(sessionId, { status: 'escalated' });

        // 3. (Optional) Trigger email notification to the SaaS admin
        // const emailService = require('../../services/emailService');
        // await emailService.sendTicketAlert(agentId, newTicket.ticket_id);

        console.log(`[Ticket Service] Ticket ${newTicket.ticket_id} created for escalation.`);
        return newTicket;
    } catch (err) {
        console.error('[Ticket Service] Error creating ticket:', err);
        throw err;
    }
};

/**
 * Resolves an existing ticket.
 */
exports.resolveTicket = async (ticketId, resolvedBy) => {
    try {
        const ticket = await SupportTicket.findOneAndUpdate(
            { ticket_id: ticketId },
            { status: 'closed', resolvedAt: new Date() },
            { new: true } // Return updated doc
        );
        return ticket;
    } catch (err) {
        console.error('[Ticket Service] Error resolving ticket:', err);
        throw err;
    }
};
