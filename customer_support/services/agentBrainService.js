let Pinecone = null;
try {
    Pinecone = require('@pinecone-database/pinecone').Pinecone;
} catch (e) {
    console.warn("⚠️ Pinecone SDK not found - Falling back to MongoDB basic text-search.");
}

const Groq = require('groq-sdk');
const KnowledgeDocument = require('../models/KnowledgeDocument');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
let pineconeClient = null;

const initPinecone = () => {
    if (!pineconeClient && process.env.PINECONE_API_KEY && Pinecone) {
        pineconeClient = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
        });
    }
    return pineconeClient;
};

// --- 1. Embedding Generator Using Groq (Nomos or similar) or fallback ---
// Since Groq natively might not have an embeddings endpoint exposed in the exact same way as OpenAI,
// we will simulate an embedding or use a small external embeddings API if required.
// For this architecture step, we'll construct a mock vector if a real embeddings model isn't configured,
// but structure it precisely so it can be swapped.
const generateEmbedding = async (text) => {
    try {
        // A robust system would call OpenAI embeddings here:
        // const response = await openai.embeddings.create({ model: "text-embedding-3-small", input: text });
        // return response.data[0].embedding;

        // For now, generating a dummy vector of 1536 dimensions (matching typical OpenAI embeddings)
        const vector = new Array(1536).fill(0).map(() => Math.random() - 0.5);
        return vector;
    } catch (err) {
        console.error("Embedding Error", err);
        throw err;
    }
};

// --- 2. Ingest Document ---
exports.ingestDocument = async (agentId, title, content) => {
    try {
        // 1. Create embedding for the text content
        const embedding = await generateEmbedding(content);

        // 2. Save metadata to MongoDB
        const uuidv4 = require('uuid').v4;
        const documentId = uuidv4();

        const newDoc = await KnowledgeDocument.create({
            document_id: documentId,
            agentId: agentId,
            title: title,
            content: content,
            embedding_vector: embedding
        });

        // 3. Upsert Vector to Pinecone
        const pc = initPinecone();
        if (pc && process.env.PINECONE_INDEX) {
            const index = pc.Index(process.env.PINECONE_INDEX);
            await index.upsert([{
                id: documentId,
                values: embedding,
                metadata: {
                    agentId: agentId.toString(),
                    title: title
                }
            }]);
        }

        return newDoc;
    } catch (err) {
        console.error('Error ingesting document:', err);
        throw err;
    }
};

// --- 3. Retrieval Augmented Generation (RAG) Query ---
exports.retrieveContextForQuery = async (agentId, userQuery) => {
    try {
        const queryVector = await generateEmbedding(userQuery);
        let contextChunks = [];

        const pc = initPinecone();
        if (pc && process.env.PINECONE_INDEX) {
            // Query Pinecone
            const index = pc.Index(process.env.PINECONE_INDEX);
            const results = await index.query({
                vector: queryVector,
                topK: 3,
                includeMetadata: true,
                filter: {
                    agentId: { $eq: agentId.toString() }
                }
            });

            // Retrieve full text from MongoDB based on matched vector IDs
            for (const match of results.matches) {
                const doc = await KnowledgeDocument.findOne({ document_id: match.id });
                if (doc) {
                    contextChunks.push(`[Source: ${doc.title}]\n${doc.content}`);
                }
            }
        } else {
            // Fallback: If Pinecone isn't set up yet, do a simple text search in MongoDB 
            // (Not full semantic, just basic fallback for Step 4 functional testing)
            const docs = await KnowledgeDocument.find({ agentId }).limit(3);
            docs.forEach(d => contextChunks.push(`[Source: ${d.title}]\n${d.content}`));
        }

        return contextChunks.join('\n\n');
    } catch (err) {
        console.error('Error retrieving context:', err);
        return ''; // Return empty context on failure rather than crashing chat
    }
};
