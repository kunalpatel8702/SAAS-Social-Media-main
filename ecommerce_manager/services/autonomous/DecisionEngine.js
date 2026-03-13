const BusinessSignal = require('../../models/BusinessSignal');
const AgentTask = require('../../models/AgentTask');
const EcommerceAIService = require('../EcommerceAIService');

class DecisionEngine {
    /**
     * The heart of the platform. Analyzes a signal and decides on an action plan.
     */
    async processIncomingSignal(signal) {
        console.log(`[DecisionEngine] Processing signal: ${signal.type} for store: ${signal.storeId}`);

        // 1. Build context for the AI
        const prompt = `
            You are the eCommerce Business Supervisor.
            A new business signal has been detected: ${signal.type}.
            Event Details: ${JSON.stringify(signal.payload)}

            Analyze this situation and decide:
            1. What is the root cause?
            2. Which expert agent should handle this (marketing, pricing, operations, support, competitor, growth, or security)?
            3. What is the step-by-step action plan to solve this or maximize revenue?

            Respond strictly in JSON:
            {
                "interpretation": "...",
                "agentRole": "marketing|pricing|inventory|customer_support|operations|competitor|growth|security",
                "planTitle": "...",
                "steps": [
                    { "action": "...", "params": {} }
                ],
                "requiresApproval": true,
                "confidence": 0.95
            }
        `;

        try {
            const decision = await EcommerceAIService._generate(prompt, 'AI Decision Engine');
            
            // 2. Persist the AgentTask for auditing and user approval
            const task = new AgentTask({
                storeId: signal.storeId,
                signalId: signal._id,
                agentRole: decision.agentRole, // Changed from agentType
                title: decision.planTitle,
                planDescription: decision.interpretation, // Changed from description
                steps: decision.steps,
                status: 'awaiting_approval', // Changed from pending_approval
                priority: decision.confidence > 0.9 ? 'high' : 'medium'
            });

            await task.save();
            console.log(`[DecisionEngine] Created AgentTask: ${task.title} (ID: ${task._id})`);
            
            return decision;
        } catch (error) {
            console.error('[DecisionEngine] AI Reasoning failed:', error.message);
            throw error;
        }
    }
}

module.exports = new DecisionEngine();
