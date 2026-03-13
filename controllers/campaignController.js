const Campaign = require('../models/Campaign');
const CampaignItem = require('../models/CampaignItem');
const Lead = require('../models/Lead');
const { Queue } = require('bullmq');
const { redisConfig } = require('../src/config/redis');
const { CampaignStatus, CampaignItemStatus } = require('../src/config/enums');

// Lazy-init the BullMQ queue
let campaignQueue = null;
const getCampaignQueue = () => {
    if (!campaignQueue) {
        campaignQueue = new Queue('campaign-execution', { connection: redisConfig });
    }
    return campaignQueue;
};

// POST /api/v1/campaigns — Create a campaign
exports.createCampaign = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { name, moduleType, customPrompt, emailConfig, aiCallConfig, leadIds } = req.body;

        if (!name || !moduleType || !leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
            return res.status(400).json({ status: 'fail', message: 'name, moduleType, and leadIds are required' });
        }

        const uniqueLeadIds = [...new Set(leadIds)];

        // Verify all leads belong to this owner
        const leads = await Lead.find({
            _id: { $in: uniqueLeadIds },
            ownerId,
            deletedAt: null,
        });

        if (leads.length !== uniqueLeadIds.length) {
            return res.status(400).json({ status: 'fail', message: 'Some leads not found or do not belong to you' });
        }

        const campaign = await Campaign.create({
            ownerId,
            name,
            moduleType,
            customPrompt: customPrompt || null,
            emailConfig: emailConfig || null,
            aiCallConfig: aiCallConfig || null,
            status: CampaignStatus.DRAFT,
            totalItems: uniqueLeadIds.length,
            createdBy: ownerId,
        });

        // Create campaign items
        const campaignItems = uniqueLeadIds.map(leadId => ({
            ownerId,
            campaignId: campaign._id,
            leadId,
            status: CampaignItemStatus.PENDING,
        }));

        await CampaignItem.insertMany(campaignItems);

        res.status(201).json({ status: 'success', data: campaign });
    } catch (err) {
        console.error('Create campaign error:', err.message);
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

// GET /api/v1/campaigns — List campaigns
exports.getCampaigns = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { status, page = 1, limit = 50 } = req.query;

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = Math.min(parseInt(limit, 10) || 50, 100);
        const skip = (pageNum - 1) * limitNum;

        const filter = { ownerId, deletedAt: null };
        if (status) filter.status = status;

        const [data, total] = await Promise.all([
            Campaign.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            Campaign.countDocuments(filter),
        ]);

        res.json({
            status: 'success',
            data: { data, total, page: pageNum, limit: limitNum },
        });
    } catch (err) {
        console.error('Get campaigns error:', err.message);
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

// GET /api/v1/campaigns/:id — Campaign details with item counts
exports.getCampaignDetails = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { id } = req.params;

        const campaign = await Campaign.findOne({ _id: id, ownerId, deletedAt: null });
        if (!campaign) {
            return res.status(404).json({ status: 'fail', message: 'Campaign not found' });
        }

        // Aggregate item status counts
        const statusCounts = await CampaignItem.aggregate([
            { $match: { campaignId: campaign._id, ownerId } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        const statusMap = {};
        statusCounts.forEach(s => { statusMap[s._id] = s.count; });

        // Fetch all items for this campaign, populated with lead info
        const items = await CampaignItem.find({ campaignId: campaign._id, ownerId })
            .populate('leadId', 'firstName lastName email companyName phone status')
            .sort({ createdAt: -1 });

        const result = campaign.toObject();
        result.successCount = statusMap[CampaignItemStatus.SUCCESS] || 0;
        result.failureCount = statusMap[CampaignItemStatus.FAILED] || 0;
        result.processedItems =
            (statusMap[CampaignItemStatus.PROCESSING] || 0) +
            result.successCount +
            result.failureCount;

        result.items = items;

        res.json({ status: 'success', data: result });
    } catch (err) {
        console.error('Get campaign details error:', err.message);
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

// POST /api/v1/campaigns/:id/start — Start a campaign
exports.startCampaign = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { id } = req.params;

        const campaign = await Campaign.findOne({ _id: id, ownerId, deletedAt: null });
        if (!campaign) {
            return res.status(404).json({ status: 'fail', message: 'Campaign not found' });
        }

        if (campaign.status !== CampaignStatus.DRAFT) {
            return res.status(400).json({ status: 'fail', message: 'Campaign must be in DRAFT status to start' });
        }

        if (campaign.totalItems === 0) {
            return res.status(400).json({ status: 'fail', message: 'Campaign must have at least one item to start' });
        }

        // Atomically update to READY
        const result = await Campaign.updateOne(
            { _id: id, ownerId, status: CampaignStatus.DRAFT, deletedAt: null },
            { $set: { status: CampaignStatus.READY } }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ status: 'fail', message: 'Failed to start campaign. It may have been modified.' });
        }

        // Dispatch to BullMQ
        const queue = getCampaignQueue();
        await queue.add('process-campaign', {
            campaignId: id,
            ownerId: ownerId.toString(),
        }, {
            jobId: id.toString(),
        });

        const updatedCampaign = await Campaign.findById(id);
        res.json({ status: 'success', data: updatedCampaign });
    } catch (err) {
        console.error('Start campaign error:', err.message);
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

// PATCH /api/v1/campaigns/:id/status — Update campaign status
exports.updateCampaignStatus = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { id } = req.params;
        const { status } = req.body;

        const campaign = await Campaign.findOne({ _id: id, ownerId, deletedAt: null });
        if (!campaign) {
            return res.status(404).json({ status: 'fail', message: 'Campaign not found' });
        }

        // Valid status transitions
        const validTransitions = {
            [CampaignStatus.DRAFT]: [CampaignStatus.READY],
            [CampaignStatus.READY]: [CampaignStatus.RUNNING],
            [CampaignStatus.RUNNING]: [CampaignStatus.COMPLETED, CampaignStatus.FAILED],
            [CampaignStatus.COMPLETED]: [],
            [CampaignStatus.FAILED]: [],
        };

        const allowed = validTransitions[campaign.status] || [];
        if (!allowed.includes(status)) {
            return res.status(400).json({
                status: 'fail',
                message: `Invalid status transition from ${campaign.status} to ${status}`,
            });
        }

        campaign.status = status;
        await campaign.save();

        res.json({ status: 'success', data: campaign });
    } catch (err) {
        console.error('Update campaign status error:', err.message);
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

// DELETE /api/v1/campaigns/:id — Soft delete
exports.softDeleteCampaign = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { id } = req.params;

        const campaign = await Campaign.findOne({ _id: id, ownerId, deletedAt: null });
        if (!campaign) {
            return res.status(404).json({ status: 'fail', message: 'Campaign not found' });
        }

        campaign.deletedAt = new Date();
        await campaign.save();

        res.json({ status: 'success', message: 'Campaign deleted' });
    } catch (err) {
        console.error('Soft delete campaign error:', err.message);
        res.status(500).json({ status: 'fail', message: err.message });
    }
};
