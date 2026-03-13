require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const AiAgent = require('./models/AiAgent');
const ChatSession = require('./models/ChatSession');
const Message = require('./models/Message');
const KnowledgeDocument = require('./models/KnowledgeDocument');
const SupportTicket = require('./models/SupportTicket');

const { startSession, sendMessage } = require('./controllers/widgetApiController');
const { draftResponse, generateFaq } = require('./controllers/powerupController');
const { getAnalytics } = require('./controllers/tenantAgentController');

const mockReq = (body, query) => ({ body: body || {}, query: query || {} });
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

async function runTests() {
    console.log('--- STARTING AI AGENT E2E TESTS ---');
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to Database");

    let agentId = null;
    let sessionId = null;

    try {
        // 1. Create User/Agent
        const dummyUserId = new mongoose.Types.ObjectId();
        const widgetToken = uuidv4();
        const agent = await AiAgent.create({
            userId: dummyUserId,
            name: "Test Cassie",
            widgetToken: widgetToken,
            systemPrompt: "You are Cassie, a helpful technical support bot. Use ONLY the given knowledge context to answer. If asked something completely unrelated or hostile, reply with [ESCALATE]."
        });
        agentId = agent._id;
        console.log(`\n✅ Created Mock Agent: ${agentId}`);

        // 2. Ingest Knowledge
        await KnowledgeDocument.create({
            document_id: uuidv4(),
            agentId: agentId,
            title: "Refund Policy",
            content: "We offer refunds within 30 days of purchase for all SaaS plans. Customers must email support@example.com."
        });
        console.log("✅ Ingested Context: Refund Policy");

        // 3. Test widgetApiController.startSession
        console.log("\n▶ Testing /api/session/start endpoint...");
        const reqStart = mockReq({ widgetToken });
        const resStart = mockRes();
        await startSession(reqStart, resStart);
        sessionId = resStart.data?.data?.session_id;
        console.log(`Response Code: ${resStart.statusCode}`);
        console.log(`Session Created: ${sessionId}`);

        // 4. Test widgetApiController.sendMessage (Normal Chat using RAG)
        console.log("\n▶ Testing /api/chat endpoint (Normal Query)...");
        const reqChat = mockReq({ session_id: sessionId, message: "What is your refund policy?" });
        const resChat = mockRes();
        await sendMessage(reqChat, resChat);
        console.log(`Response Code: ${resChat.statusCode}`);
        console.log(`AI Reply: "${resChat.data?.data?.response?.text}"`);
        console.log(`Escalated? ${resChat.data?.data?.isEscalated}`);

        // 5. Check Escalation Trigger
        console.log("\n▶ Testing /api/chat endpoint (Triggering Escalation)...");
        const reqEscalate = mockReq({ session_id: sessionId, message: "I want to talk to a human right now! You bots are useless!!!" });
        const resEscalate = mockRes();
        await sendMessage(reqEscalate, resEscalate);
        console.log(`AI Reply: "${resEscalate.data?.data?.response?.text}"`);
        console.log(`Escalated? ${resEscalate.data?.data?.isEscalated}`);

        // 6. Test Analytics
        console.log("\n▶ Testing /api/admin/analytics endpoint...");
        const reqAnalytics = mockReq({}, { agentId: agentId.toString() });
        const resAnalytics = mockRes();
        await getAnalytics(reqAnalytics, resAnalytics);
        console.log(`Tickets Logged: ${resAnalytics.data?.data?.tickets?.total}`);
        console.log(`Total Messages logged: ${resAnalytics.data?.data?.totalMessages}`);

        // 7. Test PowerUp - Draft Response
        console.log("\n▶ Testing /api/powerups/draft-response endpoint...");
        const reqDraft = mockReq({ agentId: agentId.toString(), customerQuery: "Do you guys do refunds? I bought it 10 days ago.", channel: "email" });
        const resDraft = mockRes();
        await draftResponse(reqDraft, resDraft);
        console.log(`Drafted Email Content:\n${resDraft.data?.data}\n`);

        console.log('--- TESTS PASSED SUCCESSFULLY ---');

    } catch (error) {
        console.error("Test Failed:", error);
    } finally {
        // Cleanup Database
        if (agentId) {
            await AiAgent.findByIdAndDelete(agentId);
            await KnowledgeDocument.deleteMany({ agentId });
            const sess = await ChatSession.findOne({ agentId });
            if (sess) {
                await Message.deleteMany({ session_id: sess._id });
                await ChatSession.deleteOne({ _id: sess._id });
            }
            await SupportTicket.deleteMany({ agentId });
        }
        await mongoose.disconnect();
        console.log("Cleanup complete. DB Disconnected.");
    }
}

runTests();
