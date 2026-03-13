const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const CampaignItem = require('../models/CampaignItem');
const Lead = require('../models/Lead');
const InstagramPost = require('../models/InstagramPost');
const FacebookPost = require('../models/FacebookPost');
const TwitterPost = require('../models/TwitterPost');
const LinkedinPost = require('../models/LinkedinPost');
const UserSubscription = require('../models/UserSubscription');
const { CampaignItemStatus } = require('../src/config/enums');

/**
 * Get unified analytics for the dashboard
 */
const getDashboardStats = async (req, res) => {
    try {
        const rawId = req.admin?._id || req.user?._id;
        if (!rawId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const ownerId = new mongoose.Types.ObjectId(rawId);
        console.log(`📊 Fetching analytics for OwnerID: ${ownerId}`);

        // 1. Lead Gen Stats
        const [campaigns, totalLeads, leadStats] = await Promise.all([
            Campaign.find({ ownerId }),
            Lead.countDocuments({ ownerId }),
            Campaign.aggregate([
                { $match: { ownerId } },
                {
                    $group: {
                        _id: null,
                        totalItems: { $sum: '$totalItems' },
                        processedItems: { $sum: '$processedItems' },
                        successCount: { $sum: '$successCount' },
                        failureCount: { $sum: '$failureCount' },
                        openedCount: { $sum: '$openedCount' },
                        clickedCount: { $sum: '$clickedCount' },
                    }
                }
            ])
        ]);

        const leadGen = (leadStats && leadStats.length > 0) ? leadStats[0] : {
            totalItems: 0,
            processedItems: 0,
            successCount: 0,
            failureCount: 0,
            openedCount: 0,
            clickedCount: 0
        };

        ['totalItems', 'processedItems', 'successCount', 'failureCount', 'openedCount', 'clickedCount'].forEach(key => {
            leadGen[key] = leadGen[key] || 0;
        });

        // 2. Social Media Stats (all platforms)
        const [igPosts, fbPosts, twPosts, liPosts] = await Promise.all([
            InstagramPost.find({ userId: ownerId }).catch(() => []),
            FacebookPost.find({ userId: ownerId }).catch(() => []),
            TwitterPost.find({ userId: ownerId }).catch(() => []),
            LinkedinPost.find({ userId: ownerId }).catch(() => []),
        ]);

        const allSocialPosts = [
            ...(igPosts || []).map(p => ({ ...p.toObject?.() || p, platform: 'instagram' })),
            ...(fbPosts || []).map(p => ({ ...p.toObject?.() || p, platform: 'facebook' })),
            ...(twPosts || []).map(p => ({ ...p.toObject?.() || p, platform: 'twitter' })),
            ...(liPosts || []).map(p => ({ ...p.toObject?.() || p, platform: 'linkedin' })),
        ];

        const social = {
            total: allSocialPosts.length,
            instagram: igPosts?.length || 0,
            facebook: fbPosts?.length || 0,
            twitter: twPosts?.length || 0,
            linkedin: liPosts?.length || 0,
            posted: allSocialPosts.filter(p => p.status === 'posted').length,
            failed: allSocialPosts.filter(p => p.status === 'failed').length,
            scheduled: allSocialPosts.filter(p => p.status === 'scheduled' || p.status === 'pending').length,
        };

        // 3. Subscription stats (deduplicated — newest per service)
        const allSubs = await UserSubscription.find({ user: ownerId }).sort({ createdAt: -1 });
        const seenSubs = new Set();
        const activeSubs = allSubs.filter(s => {
            const id = s.service?.toString();
            if (!id || seenSubs.has(id)) return false;
            seenSubs.add(id);
            return s.isActive;
        });

        // 4. Total Tasks = social posts + campaign items
        const totalTasks = social.total + leadGen.totalItems;

        // 5. Efficiency Gain = success rate across all processed work
        const totalSuccessful = social.posted + leadGen.successCount;
        const totalProcessed = social.posted + social.failed + leadGen.processedItems;
        const efficiencyGain = totalProcessed > 0
            ? Math.round((totalSuccessful / totalProcessed) * 100)
            : 0;

        // 6. Daily Activity (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyActivity = await CampaignItem.aggregate([
            {
                $match: {
                    ownerId,
                    status: CampaignItemStatus.SUCCESS,
                    updatedAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 7. Module Performance Breakdown
        const modulePerformance = await Campaign.aggregate([
            { $match: { ownerId } },
            {
                $group: {
                    _id: "$moduleType",
                    success: { $sum: "$successCount" },
                    total: { $sum: "$totalItems" }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalLeads,
                    totalCampaigns: campaigns.length,
                    leadGen,
                    social,
                    activeSubscriptions: activeSubs.length,
                    totalTasks,
                    efficiencyGain,
                },
                dailyActivity,
                modulePerformance,
                allPosts: allSocialPosts.sort((a, b) =>
                    new Date(b.scheduledAt || b.createdAt) - new Date(a.scheduledAt || a.createdAt)
                )
            }
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
};

module.exports = {
    getDashboardStats
};
