const Lead = require('../models/Lead');
const User = require('../models/User');
const { Queue } = require('bullmq');
const { redisConfig } = require('../src/config/redis');

const FREE_TIER_TOTAL_LEAD_LIMIT = 10;

// Lazy-init the BullMQ queue
let scraperQueue = null;
const getScraperQueue = () => {
    if (!scraperQueue) {
        scraperQueue = new Queue('scraper-jobs', { connection: redisConfig });
    }
    return scraperQueue;
};

// GET /api/v1/scraper/quota — Get lead quota status
exports.getQuota = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const isAdmin = req.user.role === 'admin';

        if (isAdmin) {
            return res.json({
                status: 'success',
                data: {
                    isPro: true,
                    totalLimit: -1, // unlimited
                    used: 0,
                    remaining: -1,
                },
            });
        }

        const total = await Lead.countDocuments({ 
            ownerId, 
            $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }]
        });

        res.json({
            status: 'success',
            data: {
                isPro: false,
                totalLimit: FREE_TIER_TOTAL_LEAD_LIMIT,
                used: total,
                remaining: Math.max(0, FREE_TIER_TOTAL_LEAD_LIMIT - total),
            },
        });
    } catch (err) {
        console.error('Get quota error:', err.message);
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

// POST /api/v1/scraper/jobs — Create a scraper job
exports.createScrapeJob = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const isAdmin = req.user.role === 'admin';
        const { query, location, limit: requestedLimit } = req.body;

        if (!query) {
            return res.status(400).json({ status: 'fail', message: 'A search query is required' });
        }

        let limit;
        const isPro = isAdmin; // Admin users get Pro tier

        if (isPro) {
            limit = requestedLimit || 10;
        } else {
            const user = await User.findById(ownerId);
            if (user && user.searchCount >= 10) {
                return res.status(403).json({
                    status: 'fail',
                    message: `You've reached the free tier limit of 10 searches. Upgrade to Pro for unlimited access.`,
                });
            }

            const queryFilter = { ownerId };
            // If the schema uses soft deletes, make sure we only count non-deleted ones.
            // Using $ne: true or similar might be safer if deletedAt isn't explicitly null.
            const total = await Lead.countDocuments({ 
                ownerId, 
                $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] 
            });
            const remaining = FREE_TIER_TOTAL_LEAD_LIMIT - total;

            if (remaining <= 0) {
                return res.status(403).json({
                    status: 'fail',
                    message: `You've reached the free tier limit of ${FREE_TIER_TOTAL_LEAD_LIMIT} leads. Upgrade to Pro for unlimited access.`,
                });
            }

            const reqLimit = requestedLimit || 10;
            limit = Math.min(reqLimit, remaining, FREE_TIER_TOTAL_LEAD_LIMIT);

            if (reqLimit > remaining) {
                console.warn(`Owner ${ownerId} requested ${reqLimit} leads but only has ${remaining} remaining. Clamping to ${limit}.`);
            }
        }

        const finalQuery = location
            ? `${query.trim()} in ${location.trim()}`
            : query.trim();

        // Push to BullMQ processing queue
        const queue = getScraperQueue();
        const job = await queue.add('scrape-keywords', {
            ownerId: ownerId.toString(),
            query: finalQuery,
            limit,
            isPro,
        });

        if (!isPro) {
            await User.findByIdAndUpdate(ownerId, { $inc: { searchCount: 1 } });
        }

        console.log(`Created scraper job ${job.id} for owner ${ownerId} (limit: ${limit})`);

        res.status(201).json({
            status: 'success',
            data: {
                message: 'Scraper job queued successfully',
                jobId: job.id,
                query,
                expectedLeads: limit,
                jobStatus: 'QUEUED',
            },
        });
    } catch (err) {
        console.error('Create scrape job error:', err.message);
        res.status(500).json({ status: 'fail', message: err.message });
    }
};
