const EcommerceAIService = require('../EcommerceAIService');

class SecurityAgent {
    /**
     * Analyze orders for potential fraud or high-risk activity
     */
    async screenForFraud(orderData, storeInfo) {
        const prompt = `
            You are the eCommerce Security & Fraud Prevention Officer.
            
            Order Details: ${JSON.stringify(orderData)}
            
            Task:
            1. Analyze the shipping address vs billing address.
            2. Check for unusual purchase frequency or high order value.
            3. Assign a Risk Score (0-100).
            4. Recommend: "approve", "review_manually", or "cancel".
            
            Respond in JSON:
            {
                "riskScore": Number,
                "riskLevel": "high|medium|low",
                "analysis": "...",
                "recommendation": "approve|review|cancel",
                "reasoning": "..."
            }
        `;

        try {
            return await EcommerceAIService._generate(prompt, 'Fraud Prevention Agent');
        } catch (error) {
            console.error('[SecurityAgent] Screening failed:', error.message);
            throw error;
        }
    }
}

module.exports = new SecurityAgent();
