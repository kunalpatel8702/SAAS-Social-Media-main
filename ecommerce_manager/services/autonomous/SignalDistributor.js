const BusinessSignal = require('../../models/BusinessSignal');
const DecisionEngine = require('./DecisionEngine');

class SignalDistributor {
    /**
     * Entry point for any external event (Webhook or Scraper)
     * Transforms it into a persisted signal and triggers the Brain.
     */
    async emit(storeId, type, rawPayload, severity = 'low') {
        try {
            // 1. Persist the signal to the database
            const signal = new BusinessSignal({
                storeId,
                type,
                payload: rawPayload,
                severity
            });
            await signal.save();

            console.log(`[SignalDistributor] New Signal: ${type} - Emitting to DecisionEngine...`);

            // 2. Trigger the Decision Engine (The reasoning loop)
            // In production, this would be an async background job (BullMQ)
            setImmediate(async () => {
                try {
                    await DecisionEngine.processIncomingSignal(signal);
                } catch (err) {
                    console.error('[SignalDistributor] Decision Engine background processing failed:', err.message);
                }
            });

            return signal;
        } catch (error) {
            console.error('[SignalDistributor] Signal emission failed:', error.message);
            throw error;
        }
    }
}

module.exports = new SignalDistributor();
