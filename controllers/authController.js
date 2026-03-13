const User = require('../models/User');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide a Google ID Token',
            });
        }

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, sub: googleId, picture: profilePicture } = ticket.getPayload();

        // 1) Find user by email or googleId
        let user = await User.findOne({ 
            $or: [{ email }, { googleId }] 
        });

        if (user) {
            // Update fields if they have changed or are missing
            let hasChanged = false;
            if (!user.googleId) { user.googleId = googleId; user.authType = 'google'; hasChanged = true; }
            if (user.profilePicture !== profilePicture) { user.profilePicture = profilePicture; hasChanged = true; }
            
            if (hasChanged) {
                await user.save({ validateBeforeSave: false });
            }
        } else {
            // 2) Create new user if doesn't exist
            user = await User.create({
                name,
                email,
                googleId,
                profilePicture,
                authType: 'google',
            });

            // Queue welcome email
            try {
                require('../src/queues/emailQueue').addEmailToQueue({
                    email: user.email,
                    name: user.name,
                    subject: 'Welcome to our SaaS Platform!',
                    message: `Hi ${user.name}, thank you for signing up with Google! We're excited to have you.`
                });
            } catch (queueErr) {
                console.error('Email queue error:', queueErr);
            }
        }

        createSendToken(user, 200, res);
    } catch (err) {
        console.error('Google Login Error:', err);
        res.status(400).json({
            status: 'fail',
            message: 'Google login failed. Please try again.',
        });
    }
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide name, email and password',
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'fail',
                message: 'Email already in use',
            });
        }

        const newUser = await User.create({
            name,
            email,
            password,
        });

        // Queue welcome email using Redis (BullMQ)
        require('../src/queues/emailQueue').addEmailToQueue({
            email: newUser.email,
            name: newUser.name,
            subject: 'Welcome to our SaaS Platform!',
            message: `Hi ${newUser.name}, thank you for signing up! We're excited to have you.`
        });

        createSendToken(newUser, 201, res);
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide email and password',
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password, user.password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Incorrect email or password',
            });
        }

        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

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

        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                status: 'fail',
                message: 'The user belonging to this token no longer exists.',
            });
        }

        req.user = currentUser;
        next();
    } catch (err) {
        res.status(401).json({
            status: 'fail',
            message: 'Invalid token or session expired',
        });
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'There is no user with that email address.',
            });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // Ensure FRONTEND_URL is available for the reset link
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetURL = `${frontendUrl}/reset-password/${resetToken}`;

        try {
            require('../src/queues/emailQueue').addEmailToQueue({
                email: user.email,
                name: user.name,
                subject: 'Your password reset token (valid for 10 min)',
                message: `Forgot your password? Click here to reset it: ${resetURL}\nIf you didn't forget your password, please ignore this email.`
            });

            res.status(200).json({
                status: 'success',
                message: 'Token sent to email!',
            });
        } catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                status: 'error',
                message: 'There was an error sending the email. Try again later!',
            });
        }
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const crypto = require('crypto');
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                status: 'fail',
                message: 'Token is invalid or has expired',
            });
        }

        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};
