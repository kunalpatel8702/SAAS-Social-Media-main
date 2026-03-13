const EcommerceAIService = require('../EcommerceAIService');

class GrowthAgent {
    /**
     * Identify scaling opportunities for the store
     */
    async identifyGrowthOpportunities(metrics, storeInfo) {
        const prompt = `
            You are the Strategic Growth Advisor.
            Current Store Metrics: ${JSON.stringify(metrics)}
            
            Based on the sales trends and top performing products, identify:
            1. 2 New product categories to expand into.
            2. A 'Winning Bundle' strategy for the top 3 products.
            3. A strategy for increasing AOV (Average Order Value).
            
            Respond in JSON:
            {
                "expansionIdeas": ["...", "..."],
                "bundleStrategy": { "title": "...", "products": [] },
                "aovGrowsHack": "..."
            }
        `;

        try {
            return await EcommerceAIService._generate(prompt, 'Growth Advisor');
        } catch (error) {
            console.error('[GrowthAgent] Growth identifying failed:', error.message);
            throw error;
        }
    }
}

module.exports = new GrowthAgent();
