const EcommerceAIService = require('../EcommerceAIService');

class OperationsAgent {
    /**
     * Specialized logic for inventory and supply chain
     */
    async handleInventoryLow(signal, storeInfo) {
        const prompt = `
            You are the Operations & Inventory Expert for an online store.
            
            Situation: Item ${signal.payload.sku} is low on stock (${signal.payload.quantity} left).
            Monthly average sales for this SKU: ${signal.payload.avgSales || '15 units'}.
            
            Task: 
            1. Forecast when we will hit zero stock.
            2. Propose a purchase order quantity based on 30-day demand.
            3. Draft a notification message for the supplier.
            
            Respond in JSON:
            {
                "forecast": "Expected stockout in X days",
                "reorderQuantity": Number,
                "supplierEmail": "...",
                "suggestedAction": "reorder|pause_ads|increase_price"
            }
        `;

        try {
            return await EcommerceAIService._generate(prompt, 'Operations Agent Action');
        } catch (error) {
            console.error('[OperationsAgent] Signal processing failed:', error.message);
            throw error;
        }
    }
}

module.exports = new OperationsAgent();
