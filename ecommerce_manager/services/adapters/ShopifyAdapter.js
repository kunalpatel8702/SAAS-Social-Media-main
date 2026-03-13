const axios = require('axios');
// In a real app, we'd import the BusinessSignal model here
// const BusinessSignal = require('../models/BusinessSignal');

class ShopifyAdapter {
    /**
     * Fetch all products from Shopify
     * @param {Object} integration - The integration record containing credentials
     */
    async fetchProducts(integration) {
        const { shopUrl, accessToken } = integration.credentials;
        try {
            const response = await axios.get(`https://${shopUrl}/admin/api/2024-01/products.json`, {
                headers: { 'X-Shopify-Access-Token': accessToken }
            });
            return response.data.products;
        } catch (error) {
            console.error('[ShopifyAdapter] Failed to fetch products:', error.message);
            throw error;
        }
    }

    /**
     * Map a Shopify order event to a BusinessSignal
     * @param {Object} shopifyOrder - Raw order data from webhook
     * @param {String} storeId - Tenant store ID
     */
    normalizeOrderSignal(shopifyOrder, storeId) {
        return {
            storeId,
            type: 'ORDER_CREATED',
            severity: 'low',
            payload: {
                orderId: shopifyOrder.id,
                total: shopifyOrder.total_price,
                currency: shopifyOrder.currency,
                customer: shopifyOrder.customer?.email,
                itemsCount: shopifyOrder.line_items?.length
            }
        };
    }

    /**
     * Update a product price on Shopify
     */
    async updateProductPrice(integration, productId, variantId, newPrice) {
        const { shopUrl, accessToken } = integration.credentials;
        try {
            const response = await axios.put(
                `https://${shopUrl}/admin/api/2024-01/variants/${variantId}.json`,
                { variant: { id: variantId, price: newPrice } },
                { headers: { 'X-Shopify-Access-Token': accessToken } }
            );
            return response.data.variant;
        } catch (error) {
            console.error('[ShopifyAdapter] Failed to update price:', error.message);
            throw error;
        }
    }
}

module.exports = new ShopifyAdapter();
