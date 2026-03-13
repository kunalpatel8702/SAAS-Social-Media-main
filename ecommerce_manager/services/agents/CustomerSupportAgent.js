const EcommerceAIService = require('../EcommerceAIService');

class CustomerSupportAgent {
    /**
     * Generate a helpful response for a customer inquiry
     */
    async handleInquiry(signal, storeInfo) {
        const prompt = `
            You are the Expert Customer Support Agent for ${storeInfo.name}.
            
            Store Policies:
            - Shipping: ${storeInfo.settings?.shippingInfo || 'Standard 5-7 days'}
            - Returns: ${storeInfo.settings?.returnPolicy || '30-day returns'}
            
            Customer Inquiry: "${signal.payload.message}"
            
            Provide a professional, helpful response. If it's a refund request, check if it aligns with the policy.
            
            Respond in JSON:
            {
                "response": "...",
                "actionRequired": "none|process_refund|escalate_to_human",
                "recommendedTag": "shipping|return|product_info"
            }
        `;

        try {
            return await EcommerceAIService._generate(prompt, 'Customer Support Agent');
        } catch (error) {
            console.error('[CustomerSupportAgent] Inquiry handling failed:', error.message);
            throw error;
        }
    }
}

module.exports = new CustomerSupportAgent();
