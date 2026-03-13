const { v4: uuidv4 } = require('uuid');
const Groq = require('groq-sdk');
const AiAgent = require('../models/AiAgent');
const ChatSession = require('../models/ChatSession');
const Message = require('../models/Message');
const SupportTicket = require('../models/SupportTicket');
const { retrieveContextForQuery } = require('./agentBrainService');
const ticketService = require('./ticketService');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Constants
const MAX_HISTORY = 10; // Keep last 10 messages for context

exports.processChatMessage = async (sessionId, userMessageText) => {
    try {
        // 1. Fetch Session and Agent params
        const session = await ChatSession.findOne({ sessionId: sessionId }).populate('agentId');
        if (!session) throw new Error('Session not found');

        const agent = session.agentId;

        // 2. Save User Message to DB
        const userMessage = await Message.create({
            message_id: uuidv4(),
            sessionId: session._id,
            sender_type: 'user',
            message_text: userMessageText
        });

        // 3. Retrieve recent chat history for context
        const recentMessages = await Message.find({ sessionId: session._id })
            .sort({ timestamp: -1 })
            .limit(MAX_HISTORY)
            .lean();

        // We need them in chronological order
        recentMessages.reverse();

        // 4. Construct Groq Messages Array
        const messagesForGroq = [
            {
                role: 'system',
                content: agent.systemPrompt + '\n\nIMPORTANT: Analyze the user\'s sentiment. If the user is extremely angry, uses profanity, or if you are entirely unsure how to help, you MUST abort troubleshooting and output exactly [ESCALATE] so a human can take over.' || 'You are a helpful customer support agent. Answer questions to the best of your ability. Analyze the user\'s sentiment. If unsure or if the user is angry, state [ESCALATE] to transfer to human support.'
            }
        ];

        recentMessages.forEach(msg => {
            // mapping 'human' to 'assistant' so the LLM knows it's the company speaking
            const role = (msg.sender_type === 'ai' || msg.sender_type === 'human') ? 'assistant' : 'user';
            messagesForGroq.push({
                role: role,
                content: msg.message_text
            });
        });

        // --- STEP 4 HOOK (RAG Integration) ---
        // Retrieve relevant context from KnowledgeDocument via agentBrainService
        const ragContext = await retrieveContextForQuery(agent._id, userMessageText);

        if (ragContext) {
            messagesForGroq[0].content += `\n\n--- KNOWLEDGE BASE CONTEXT ---\nUse the following information to answer the user if relevant:\n${ragContext}`;
        }

        // 5. Call LLM
        const chatCompletion = await groq.chat.completions.create({
            messages: messagesForGroq,
            model: 'llama-3.1-8b-instant',
            temperature: 0.3, // Lower temp for more factual/support-oriented answers
            max_tokens: 512
        });

        const aiResponseText = chatCompletion.choices[0]?.message?.content || 'I encountered an error processing that.';

        // 6. Check for Escalation Flag (Step 5 hook)
        let isEscalated = false;
        let finalResponseText = aiResponseText;

        if (aiResponseText.includes('[ESCALATE]')) {
            isEscalated = true;
            finalResponseText = "I'm not completely sure about that. Let me get a human agent to assist you.";

            // Use the dedicated Ticket Service to handle the escalation flow
            await ticketService.createTicketAndEscalate(
                session._id,
                agent._id,
                session.user_id,
                `Automatic AI Escalation based on query: "${userMessageText}"`
            );
        }

        // 7. Save AI Response to DB
        const aiMessage = await Message.create({
            message_id: uuidv4(),
            sessionId: session._id,
            sender_type: 'ai',
            message_text: finalResponseText
        });

        // Return the formatted response to controller
        return {
            success: true,
            userMessage: {
                id: userMessage.message_id,
                text: userMessage.message_text,
                timestamp: userMessage.timestamp
            },
            response: {
                id: aiMessage.message_id,
                text: aiMessage.message_text,
                timestamp: aiMessage.timestamp
            },
            isEscalated
        };

    } catch (err) {
        console.error('Error in processChatMessage:', err);
        throw err;
    }
};
