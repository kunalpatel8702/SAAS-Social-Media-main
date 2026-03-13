const EcommerceAIService = require('../EcommerceAIService');

class MarketingAgent {
    /**
     * Specialized logic for generating high-performance marketing strategies
     */
    async planCampaign(signal, storeInfo) {
        const prompt = `
            You are the Expert Marketing Agent for an eCommerce store.
            Context: A business signal was detected: ${signal.type}. 
            Store Niche: ${storeInfo.niche}
            Goal: Maximize ROAS (Return on Ad Spend) and recover sales.

            Based on the event ${JSON.stringify(signal.payload)}, propose 3 marketing tactics:
            1. An email recovery sequence
            2. A social media ad campaign strategy
            3. A promotional discount strategy (if needed)

            Respond in JSON with a 'tactics' array.
        `;

        try {
            return await EcommerceAIService._generate(prompt, 'Marketing Agent Plan');
        } catch (error) {
            console.error('[MarketingAgent] Planning failed:', error.message);
            throw error;
        }
    }

    /**
     * Automatically generate ad creative copy
     */
    async generateAdCreatives(product) {
        return await EcommerceAIService.generateMarketingCopy({
            type: 'facebook-ad',
            productInfo: `${product.name} - ${product.description}`,
            campaignGoal: 'Conversion',
            targetAudience: 'Potential buyers'
        });
    }
}

module.exports = new MarketingAgent();
