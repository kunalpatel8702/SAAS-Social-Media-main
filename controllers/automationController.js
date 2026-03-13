const AutomationService = require('../models/AutomationService');
const UserSubscription = require('../models/UserSubscription');

// @desc    Get all automation services
// @route   GET /api/v1/automation
// @access  Public
exports.getAllServices = async (req, res) => {
    try {
        // Return all services so they are visible even if inactive
        // (Marketplace will decide whether to hide or show "Not Available" message)
        const services = await AutomationService.find({});

        res.status(200).json({
            status: 'success',
            results: services.length,
            data: { services }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// @desc    Get single automation service
// @route   GET /api/v1/automation/:id
// @access  Public
exports.getService = async (req, res) => {
    try {
        const service = await AutomationService.findById(req.params.id);
        if (!service) {
            return res.status(404).json({
                status: 'fail',
                message: 'Service not found'
            });
        }
        res.status(200).json({
            status: 'success',
            data: { service }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// @desc    Create new automation service
// @route   POST /api/v1/automation
// @access  Private (Admin)
exports.createService = async (req, res) => {
    try {
        const newService = await AutomationService.create({
            ...req.body,
            createdBy: req.admin ? req.admin._id : null
        });

        res.status(201).json({
            status: 'success',
            data: { service: newService }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// @desc    Update automation service
// @route   PATCH /api/v1/automation/:id
// @access  Private (Admin)
exports.updateService = async (req, res) => {
    try {
        const service = await AutomationService.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!service) {
            return res.status(404).json({
                status: 'fail',
                message: 'Service not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: { service }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// @desc    Delete automation service
// @route   DELETE /api/v1/automation/:id
// @access  Private (Admin)
exports.deleteService = async (req, res) => {
    try {
        const service = await AutomationService.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).json({
                status: 'fail',
                message: 'Service not found'
            });
        }
        // Remove all subscriptions tied to this service
        await UserSubscription.deleteMany({ service: service._id });

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};


// @desc    Subscribe to a service (Manual for now, without payment)
// @route   POST /api/v1/automation/subscribe/:id
// @access  Private (User)
exports.subscribeToService = async (req, res) => {
    try {
        const service = await AutomationService.findById(req.params.id);
        if (!service) {
            return res.status(404).json({
                status: 'fail',
                message: 'Service not found'
            });
        }

        // Check if service is active
        if (!service.isActive) {
            return res.status(400).json({
                status: 'fail',
                message: 'This automation service is not available right now'
            });
        }

        // Check if user already has an active subscription for this service
        const existing = await UserSubscription.findOne({
            user: req.user._id,
            service: service._id,
            isActive: true
        });
        if (existing) {
            return res.status(400).json({
                status: 'fail',
                message: 'You already have an active subscription for this service'
            });
        }

        // Calculate end date based on duration (default 30 days)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + (service.durationInDays || 30));

        // Use requested currency or default to service default
        const selectedCurrency = req.body.currency || service.currency || 'INR';
        const price = selectedCurrency === 'INR' ? (service.priceINR || service.price) : (service.priceUSD || service.price);

        const subscription = await UserSubscription.create({
            user: req.user._id,
            service: service._id,
            startDate,
            endDate,
            amountPaid: price,
            currency: selectedCurrency,
            status: 'active',
            isActive: true
        });

        res.status(201).json({
            status: 'success',
            data: { subscription }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// @desc    Get user's subscriptions
// @route   GET /api/v1/automation/my/subscriptions
// @access  Private (User)
exports.getMySubscriptions = async (req, res) => {
    try {
        const subscriptions = await UserSubscription.find({ user: req.user._id })
            .populate('service')
            .sort({ createdAt: -1 }); // newest first

        // Deduplicate: keep only the most recent subscription per service
        const seen = new Set();
        const deduplicated = subscriptions.filter(sub => {
            const serviceId = sub.service?._id?.toString() || sub.service?.toString();
            if (!serviceId || seen.has(serviceId)) return false;
            seen.add(serviceId);
            return true;
        });

        res.status(200).json({
            status: 'success',
            results: deduplicated.length,
            data: { subscriptions: deduplicated }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// @desc    One-time cleanup: remove duplicate subscriptions (keep newest per user+service)
// @route   POST /api/v1/automation/admin/cleanup-duplicates
// @access  Private
exports.cleanupDuplicateSubscriptions = async (req, res) => {
    try {
        const all = await UserSubscription.find({}).sort({ createdAt: -1 });
        const seen = new Map();
        const toDelete = [];
        for (const sub of all) {
            const userId    = sub.user    ? sub.user.toString()    : null;
            const serviceId = sub.service ? sub.service.toString() : null;
            if (!userId || !serviceId) continue;
            const key = userId + '_' + serviceId;
            if (seen.has(key)) {
                toDelete.push(sub._id);
            } else {
                seen.set(key, true);
            }
        }
        if (toDelete.length > 0) {
            await UserSubscription.deleteMany({ _id: { $in: toDelete } });
        }
        res.status(200).json({
            status: 'success',
            message: 'Cleanup complete. Removed ' + toDelete.length + ' duplicate(s).',
            data: { removed: toDelete.length }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
