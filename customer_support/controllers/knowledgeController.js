const agentBrainService = require('../services/agentBrainService');
const AiAgent = require('../models/AiAgent');

/**
 * Controller to handle uploading and ingesting plain text into the Knowledge Base RAG.
 */
exports.uploadTextKnowledge = async (req, res) => {
    try {
        let { agentId, title, content } = req.body;

        if (!agentId || !title || !content) {
            return res.status(400).json({ success: false, error: 'agentId, title, and content are required' });
        }

        // [MOCK DEMO LOGIC] Translate frontend placeholder into actual ObjectId
        if (agentId === 'demo-agent-123' || agentId === 'demo-agent-id') {
            const agent = await AiAgent.findOne({ widgetToken: 'demo-token-123' });
            if (!agent) {
                return res.status(400).json({ success: false, error: 'Demo agent not found. Please click the chat widget first to auto-generate it.' });
            }
            agentId = agent._id;
        }

        // Send to RAG service to chunk, generate embedding, and save to Vector DB
        const newDoc = await agentBrainService.ingestDocument(agentId, title, content);

        res.status(201).json({
            success: true,
            message: 'Knowledge Document successfully ingested into Vector DB.',
            document_id: newDoc.document_id
        });
    } catch (err) {
        console.error('[Knowledge Controller] Error uploading text:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Basic website scraping endpoint (Proof of Concept).
 * Requires `cheerio` installed to extract visible text from HTML.
 */
exports.scrapeUrlKnowledge = async (req, res) => {
    try {
        let { agentId, url } = req.body;

        if (!agentId || !url) {
            return res.status(400).json({ success: false, error: 'agentId and url are required' });
        }

        // [MOCK DEMO LOGIC] Translate frontend placeholder into actual ObjectId
        if (agentId === 'demo-agent-123' || agentId === 'demo-agent-id') {
            const agent = await AiAgent.findOne({ widgetToken: 'demo-token-123' });
            if (!agent) {
                return res.status(400).json({ success: false, error: 'Demo agent not found. Please click the chat widget first to auto-generate it.' });
            }
            agentId = agent._id;
        }

        // Dynamically require cheerio
        let cheerio;
        try {
            cheerio = require('cheerio');
        } catch (e) {
            return res.status(500).json({ success: false, error: 'Cheerio is not installed. Run `npm install cheerio`.' });
        }

        // Fetch URL HTML
        const response = await fetch(url);
        const html = await response.text();

        // Load into Cheerio and extract text
        const $ = cheerio.load(html);
        $('script, style, noscript').remove();
        const content = $('body').text().replace(/\s+/g, ' ').trim();

        if (content.length < 50) {
            return res.status(400).json({ success: false, error: 'Could not extract enough text from URL.' });
        }

        // We ideally chunk here, but for now we ingest the raw content
        const title = $('title').text() || url;
        const newDoc = await agentBrainService.ingestDocument(agentId, title, content);

        res.status(201).json({
            success: true,
            message: `URL scraped and ingested successfully. Extracted ${content.length} characters.`,
            document_id: newDoc.document_id
        });
    } catch (err) {
        console.error('[Knowledge Controller] Error scraping URL:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
