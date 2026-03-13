const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Protect admin routes - verify JWT token and check Admin collection
exports.protect = async (req, res, next) => {
    try {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                status: 'fail',
                message: 'You are not logged in! Please log in to get access.',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token ID:', decoded.id);
        
        const currentAdmin = await Admin.findById(decoded.id);
        console.log('Found admin:', currentAdmin);
        
        if (!currentAdmin) {
            return res.status(401).json({
                status: 'fail',
                message: 'The admin belonging to this token no longer exists.',
            });
        }

        req.admin = currentAdmin;
        next();
    } catch (err) {
        console.log('Auth error:', err.message);
        res.status(401).json({
            status: 'fail',
            message: 'Invalid token or session expired',
        });
    }
};

// Restrict to admin only (always passes now since we check Admin collection)
exports.restrictToAdmin = (req, res, next) => {
    if (req.admin.role !== 'admin') {
        return res.status(403).json({
            status: 'fail',
            message: 'You do not have permission to perform this action',
        });
    }
    next();
};
