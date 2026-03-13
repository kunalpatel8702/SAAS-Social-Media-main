const SignalDistributor = require('../services/autonomous/SignalDistributor');
const Integration = require('../models/Integration');
const ShopifyAdapter = require('../services/adapters/ShopifyAdapter');

/**
 * Handles incoming webhooks from external platforms (Shopify, Stripe, Meta)
 */
exports.handleShopifyWebhook = async (req, res) => {
    try {
        const topic = req.headers['x-shopify-topic'];
        const shopUrl = req.headers['x-shopify-shop-domain'];
        const payload = req.body;

        // 1. Identify the store and integration
        const integration = await Integration.findOne({ 
            'credentials.shopUrl': shopUrl, 
            provider: 'shopify' 
        });

        if (!integration) {
            console.error(`[WebhookHandler] No integration found for shop: ${shopUrl}`);
            return res.status(404).end();
        }

        // 2. Validate HMAC (In production, use crypto to verify shopify signature)
        // verifyShopifySignature(req);

        // 3. Map event to signal
        let signalData;
        
        switch (topic) {
            case 'orders/create':
                signalData = ShopifyAdapter.normalizeOrderSignal(payload, integration.storeId);
                break;
            case 'products/update':
                // Check if stock is low or price changed
                const variant = payload.variants?.[0];
                if (variant && variant.inventory_quantity < 5) {
                    signalData = {
                        storeId: integration.storeId,
                        type: 'LOW_STOCK',
                        payload: { productId: payload.id, sku: variant.sku, quantity: variant.inventory_quantity }
                    };
                }
                break;
            default:
                console.log(`[WebhookHandler] Ignoring unhandled topic: ${topic}`);
                return res.status(200).end();
        }

        // 4. Distribute the signal to the AI system
        if (signalData) {
            await SignalDistributor.emit(
                signalData.storeId, 
                signalData.type, 
                signalData.payload
            );
        }

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('[WebhookHandler] Process failed:', err.message);
        res.status(500).end();
    }
};
