const Lead = require('../models/Lead');
const { LeadStatus } = require('../src/config/enums');
const { scoreLead } = require('../services/scoringService');

// POST /api/v1/leads — Create single lead
exports.createLead = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { category, companyName, contactName, phone, email, website, facebook, linkedin, instagram, source, rawData } = req.body;

        const lead = await Lead.create({
            ownerId,
            category,
            companyName,
            contactName,
            phone,
            email,
            website,
            facebook,
            linkedin,
            instagram,
            source,
            rawData,
            status: LeadStatus.NEW,
        });

        res.status(201).json({ status: 'success', data: lead });
    } catch (err) {
        console.error('Create lead error:', err.message);
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

// POST /api/v1/leads/bulk — Bulk insert with deduplication
exports.createManyLeads = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { leads } = req.body;

        if (!leads || !Array.isArray(leads) || leads.length === 0) {
            return res.status(400).json({ status: 'fail', message: 'leads array is required' });
        }

        // Collect websites and phones for dedup check
        const websites = leads.map(l => l.website).filter(Boolean);
        const phones = leads.map(l => l.phone).filter(Boolean);

        // Find existing leads by website or phone
        const conditions = [];
        if (websites.length > 0) {
            conditions.push({ ownerId, deletedAt: null, website: { $in: websites } });
        }
        if (phones.length > 0) {
            conditions.push({ ownerId, deletedAt: null, phone: { $in: phones } });
        }

        const existingLeads = conditions.length > 0
            ? await Lead.find({ $or: conditions })
            : [];

        const existingWebsites = new Set(
            existingLeads.map(l => l.website).filter(Boolean)
        );
        const existingPhones = new Set(
            existingLeads.map(l => l.phone).filter(Boolean)
        );

        const uniqueLeads = [];
        let skippedDuplicates = 0;

        for (const lead of leads) {
            const hasWebsite = lead.website != null && lead.website !== '';
            const hasPhone = lead.phone != null && lead.phone !== '';

            if (!hasWebsite && !hasPhone) {
                uniqueLeads.push(lead);
                continue;
            }

            const isDuplicate =
                (hasWebsite && existingWebsites.has(lead.website)) ||
                (hasPhone && existingPhones.has(lead.phone));

            if (isDuplicate) {
                skippedDuplicates++;
            } else {
                uniqueLeads.push(lead);
                if (hasWebsite) existingWebsites.add(lead.website);
                if (hasPhone) existingPhones.add(lead.phone);
            }
        }

        if (uniqueLeads.length === 0) {
            return res.json({ status: 'success', data: { inserted: 0, skippedDuplicates } });
        }

        const newLeads = uniqueLeads.map(lead => ({
            ownerId,
            ...lead,
            status: LeadStatus.NEW,
        }));

        await Lead.insertMany(newLeads);

        res.status(201).json({
            status: 'success',
            data: { inserted: newLeads.length, skippedDuplicates },
        });
    } catch (err) {
        console.error('Bulk create leads error:', err.message);
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

// GET /api/v1/leads — Paginated list with optional status filter
exports.getLeads = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { status, page = 1, limit = 50 } = req.query;

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = Math.min(parseInt(limit, 10) || 50, 100);
        const skip = (pageNum - 1) * limitNum;

        const filter = { ownerId, deletedAt: null };
        if (status) filter.status = status;

        const [data, total] = await Promise.all([
            Lead.find(filter).sort({ score: -1, createdAt: -1 }).skip(skip).limit(limitNum),
            Lead.countDocuments(filter),
        ]);

        res.json({
            status: 'success',
            data: { data, total, page: pageNum, limit: limitNum },
        });
    } catch (err) {
        console.error('Get leads error:', err.message);
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

// PATCH /api/v1/leads/:id/status — Update lead status
exports.updateLeadStatus = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { id } = req.params;
        const { status } = req.body;

        const lead = await Lead.findOne({ _id: id, ownerId, deletedAt: null });
        if (!lead) {
            return res.status(404).json({ status: 'fail', message: 'Lead not found' });
        }

        lead.status = status;
        if (status === LeadStatus.CONTACTED) {
            lead.lastContactedAt = new Date();
        }

        await lead.save();
        res.json({ status: 'success', data: lead });
    } catch (err) {
        console.error('Update lead status error:', err.message);
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

// DELETE /api/v1/leads/:id — Soft delete
exports.softDeleteLead = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { id } = req.params;

        const lead = await Lead.findOne({ _id: id, ownerId, deletedAt: null });
        if (!lead) {
            return res.status(404).json({ status: 'fail', message: 'Lead not found' });
        }

        lead.deletedAt = new Date();
        await lead.save();
        res.json({ status: 'success', message: 'Lead deleted' });
    } catch (err) {
        console.error('Soft delete lead error:', err.message);
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

// PUT /api/v1/leads/:id — Update lead fields
exports.updateLead = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { id } = req.params;
        const { companyName, contactName, phone, email, website, source } = req.body;

        const lead = await Lead.findOne({ _id: id, ownerId, deletedAt: null });
        if (!lead) {
            return res.status(404).json({ status: 'fail', message: 'Lead not found' });
        }

        if (companyName !== undefined) lead.companyName = companyName;
        if (contactName !== undefined) lead.contactName = contactName;
        if (phone !== undefined) lead.phone = phone;
        if (email !== undefined) lead.email = email;
        if (website !== undefined) lead.website = website;
        if (source !== undefined) lead.source = source;

        await lead.save();
        res.json({ status: 'success', data: lead });
    } catch (err) {
        console.error('Update lead error:', err.message);
        res.status(500).json({ status: 'fail', message: err.message });
    }
};
// POST /api/v1/leads/:id/score — Score a single lead manually
exports.scoreSingleLead = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { id } = req.params;

        const lead = await Lead.findOne({ _id: id, ownerId, deletedAt: null });
        if (!lead) {
            return res.status(404).json({ status: 'fail', message: 'Lead not found' });
        }

        const { score, insights } = await scoreLead(lead);
        lead.score = score;
        lead.scoreInsights = insights;
        await lead.save();

        res.json({ status: 'success', data: lead });
    } catch (err) {
        console.error('Score lead error:', err.message);
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

// POST /api/v1/leads/score-all — Score all unscored leads
exports.scoreAllLeads = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const leads = await Lead.find({ ownerId, score: 0, deletedAt: null }).limit(10); // Batch limit for safety

        const results = [];
        for (const lead of leads) {
            const { score, insights } = await scoreLead(lead);
            lead.score = score;
            lead.scoreInsights = insights;
            await lead.save();
            results.push(lead);
        }

        res.json({ status: 'success', data: { scored: results.length } });
    } catch (err) {
        console.error('Score all leads error:', err.message);
        res.status(500).json({ status: 'fail', message: err.message });
    }
};
