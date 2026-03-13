const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const CampaignItem = require('../models/CampaignItem');
const Campaign = require('../models/Campaign');
const { CampaignItemStatus, CampaignStatus } = require('../src/config/enums');

/**
 * POST /api/v1/webhooks/vapi
 * Receives call outcome events from VAPI after each call ends.
 * VAPI sends: end-of-call-report, call-started, status-update, etc.
 *
 * Docs: https://docs.vapi.ai/server-url/events
 */
router.post('/vapi', async (req, res) => {
    try {
        const event = req.body;
        const type = event?.message?.type || event?.type;

        // Only process end-of-call reports
        if (type !== 'end-of-call-report') {
            return res.status(200).json({ received: true });
        }

        const callData = event?.message || event;
        const metadata = callData?.call?.metadata || callData?.metadata || {};
        const { campaignId, leadId } = metadata;

        if (!campaignId || !leadId) {
            console.warn('[VAPI Webhook] Missing campaignId or leadId in metadata:', metadata);
            return res.status(200).json({ received: true });
        }

        // Determine outcome
        const endedReason = callData?.call?.endedReason || callData?.endedReason || 'unknown';
        const transcript = callData?.transcript || callData?.call?.transcript || '';
        const recordingUrl = callData?.recordingUrl || callData?.call?.recordingUrl || '';
        const summary = callData?.summary || callData?.call?.analysis?.summary || '';
        const durationSecs = callData?.call?.endedAt
            ? Math.round((new Date(callData.call.endedAt) - new Date(callData.call.startedAt)) / 1000)
            : 0;

        // Classify outcome
        const POSITIVE_ENDINGS = ['customer-ended-call', 'assistant-ended-call'];
        const VOICEMAIL_ENDINGS = ['voicemail', 'no-answer'];
        let callOutcome = 'completed';
        if (VOICEMAIL_ENDINGS.some(r => endedReason.toLowerCase().includes(r))) {
            callOutcome = 'voicemail';
        } else if (endedReason.toLowerCase().includes('error')) {
            callOutcome = 'failed';
        }

        console.log(`📞 VAPI Webhook: lead=${leadId} | outcome=${callOutcome} | reason=${endedReason} | duration=${durationSecs}s`);

        // Update campaign item
        await CampaignItem.updateOne(
            { campaignId, leadId },
            {
                $set: {
                    status: callOutcome === 'failed' ? CampaignItemStatus.FAILED : CampaignItemStatus.SUCCESS,
                    result: { callOutcome, endedReason, transcript, recordingUrl, summary, durationSecs },
                    completedAt: new Date(),
                    lastAttemptAt: new Date(),
                },
            }
        );

        // Mark lead as CONTACTED (if the call connected)
        if (callOutcome !== 'failed') {
            await Lead.updateOne(
                { _id: leadId },
                { $set: { status: 'CONTACTED', lastContactedAt: new Date() } }
            );
        }

        // Update campaign counters
        if (callOutcome === 'failed') {
            await Campaign.updateOne({ _id: campaignId }, { $inc: { failureCount: 1, processedItems: 1 } });
        } else {
            await Campaign.updateOne({ _id: campaignId }, { $inc: { successCount: 1, processedItems: 1 } });
        }

        res.status(200).json({ received: true, callOutcome });
    } catch (err) {
        console.error('[VAPI Webhook] Error:', err.message);
        // Always 200 so VAPI doesn't retry endlessly
        res.status(200).json({ received: true, error: err.message });
    }
});

module.exports = router;
