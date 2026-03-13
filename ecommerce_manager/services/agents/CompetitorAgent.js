const EcommerceAIService = require('../EcommerceAIService');

class CompetitorAgent {
    /**
     * Analyze rival store pricing and marketing moves
     */
    async analyzeCompetitorMove(signal, storeInfo) {
        const prompt = `
            You are the Market Intelligence Agent for ${storeInfo.name}.
            
            Observation: A top competitor has changed their price for a similar product.
            Details: ${JSON.stringify(signal.payload)}
            Our product price: ${signal.payload.ourPrice}
            
            Task:
            1. Determine if this is a threat to our conversion rate.
            2. Suggest a response (Match price, Bundle, or emphasize quality).
            
            Respond in JSON:
            {
                "threatLevel": "high|medium|low",
                "analysis": "...",
                "counterMove": "price_drop|offer_bundle|loyalty_points",
                "reasoning": "..."
            }
        `;

        try {
            return await EcommerceAIService._generate(prompt, 'Competitor Intelligence Agent');
        } catch (error) {
            console.error('[CompetitorAgent] Analysis failed:', error.message);
            throw error;
        }
    }
}

module.exports = new CompetitorAgent();
