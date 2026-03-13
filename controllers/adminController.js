const Admin = require('../models/Admin');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Admin login
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide email and password',
            });
        }

        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin || !(await admin.comparePassword(password, admin.password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Incorrect email or password',
            });
        }

        const token = signToken(admin._id);
        admin.password = undefined;

        res.status(200).json({
            status: 'success',
            token,
            data: { admin },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: { users },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found',
            });
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

// Get single user (admin only)
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found',
            });
        }
        res.status(200).json({
            status: 'success',
            data: { user },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

// Create admin user
exports.createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                status: 'fail',
                message: 'Email already in use',
            });
        }
        const newAdmin = await Admin.create({ name, email, password });
        newAdmin.password = undefined;
        res.status(201).json({
            status: 'success',
            data: { admin: newAdmin },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

// Get all admins (admin only)
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password');
        res.status(200).json({
            status: 'success',
            results: admins.length,
            data: { admins },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

// Delete admin (admin only)
exports.deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.id);
        if (!admin) {
            return res.status(404).json({
                status: 'fail',
                message: 'Admin not found',
            });
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

// Get all user videos (admin only)
exports.getAllVideos = async (req, res) => {
    try {
        const Video = require('../models/Video');
        const videos = await Video.find({}).populate('user', 'name email').sort({ createdAt: -1 });

        // Helper for generating absolute URLs for local files
        const getPublicUrl = (req, filePath) => {
            if (!filePath || !filePath.startsWith('/public')) return filePath;
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const host = req.headers['x-forwarded-host'] || req.get('host');
            return `${protocol}://${host}${filePath}`;
        };

        const result = videos.map(v => {
            const video = v.toObject();
            return {
                ...video,
                videoUrl: getPublicUrl(req, video.videoUrl),
            };
        });

        res.status(200).json({
            status: 'success',
            results: result.length,
            data: { videos: result },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

// Toggle video publish status (admin only)
exports.toggleVideoPublish = async (req, res) => {
    try {
        const Video = require('../models/Video');
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                status: 'fail',
                message: 'Video not found',
            });
        }

        video.isActive = !video.isActive;
        await video.save();

        res.status(200).json({
            status: 'success',
            data: { video },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};
// Get Admin Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const User = require('../models/User');
        const UserSubscription = require('../models/UserSubscription');
        const AutomationService = require('../models/AutomationService');
        const CampaignItem = require('../models/CampaignItem');
        const { CampaignItemStatus } = require('../src/config/enums');

        // Total Users
        const totalUsers = await User.countDocuments();

        // Total Revenue (Sum of amountPaid in UserSubscription)
        const revenueAgg = await UserSubscription.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: null, totalRevenue: { $sum: '$amountPaid' } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

        // Active Services/Subscriptions
        const activeSubscriptions = await UserSubscription.countDocuments({ isActive: true });
        const totalServices = await AutomationService.countDocuments();

        // System Health (Success rate of campaign items in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const healthAgg = await CampaignItem.aggregate([
            { $match: { updatedAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    success: { $sum: { $cond: [{ $eq: ['$status', CampaignItemStatus.SUCCESS] }, 1, 0] } }
                }
            }
        ]);
        
        let systemHealth = 99.9;
        if (healthAgg.length > 0 && healthAgg[0].total > 0) {
            const rate = (healthAgg[0].success / healthAgg[0].total) * 100;
            // Cap at 100, ensure it doesn't look terrible unless it actually is
            systemHealth = Math.round(rate * 10) / 10;
        }

        res.status(200).json({
            status: 'success',
            data: {
                totalUsers,
                totalRevenue,
                activeSubscriptions,
                totalServices,
                systemHealth
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};
