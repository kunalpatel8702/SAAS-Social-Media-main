const axios = require('axios');
const LinkedinPost = require('../../models/LinkedinPost');
const LinkedinAccount = require('../../models/LinkedinAccount');
const { scheduleLinkedinPost } = require('../../src/queues/linkedinQueue');

exports.getAuthUrl = (req, res) => {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    const { serviceId } = req.query;

    const scope = ['openid', 'profile', 'email', 'w_member_social'].join(' ');

    const state = JSON.stringify({
        serviceId,
        platform: 'linkedin',
        userId: req.user._id
    });

    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scope)}`;

    res.status(200).json({ status: 'success', url });
};

exports.handleCallback = async (req, res) => {
    console.log('🔔 Linkedin callback HIT!');
    try {
        const { code, state } = req.query;
        if (!code) {
            return res.status(400).json({ status: 'fail', message: 'No code provided' });
        }

        let serviceId = '';
        let userId = '';
        if (state) {
            try {
                const parsedState = JSON.parse(state);
                serviceId = parsedState.serviceId;
                userId = parsedState.userId;
            } catch (e) {
                console.error('Error parsing state:', e);
            }
        }

        const clientId = process.env.LINKEDIN_CLIENT_ID;
        const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
        const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

        const tokenRes = await axios.post('https://www.linkedin.com/oauth/v2/accessToken',
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri
            }).toString(),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );

        const accessToken = tokenRes.data.access_token;

        // Get profile info using openid profile
        const profileRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const profile = profileRes.data;

        await LinkedinAccount.findOneAndUpdate(
            { linkedinId: profile.sub },
            {
                userId: userId,
                linkedinId: profile.sub,
                name: profile.name,
                accessToken: accessToken,
                profilePicture: profile.picture || '',
                isActive: true
            },
            { upsert: true, new: true }
        );

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        if (serviceId) {
            return res.redirect(`${frontendUrl}/service-manager/${serviceId}?connected=linkedin`);
        }

        res.redirect(`${frontendUrl}/my-services?connected=linkedin`);
    } catch (err) {
        console.error('❌ Linkedin Auth Error:', err.response?.data || err.message);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/my-services?error=linkedin_connection_failed`);
    }
};

exports.getConnectedAccounts = async (req, res) => {
    try {
        const accounts = await LinkedinAccount.find({ userId: req.user._id, isActive: true });
        res.status(200).json({
            status: 'success',
            results: accounts.length,
            data: { accounts }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.schedulePost = async (req, res) => {
    try {
        const { linkedinAccountId, text, mediaUrl, scheduledAt } = req.body;

        if (!linkedinAccountId || !text || !scheduledAt) {
            return res.status(400).json({ status: 'fail', message: 'Missing required fields' });
        }

        const account = await LinkedinAccount.findOne({ _id: linkedinAccountId, userId: req.user._id });
        if (!account) {
            return res.status(404).json({ status: 'fail', message: 'Linkedin account not found' });
        }

        const post = await LinkedinPost.create({
            userId: req.user._id,
            linkedinAccountId,
            text,
            mediaUrl,
            scheduledAt,
            status: 'scheduled'
        });

        await scheduleLinkedinPost(post);

        res.status(201).json({
            status: 'success',
            data: { post }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const posts = await LinkedinPost.find({ userId: req.user._id })
            .populate('linkedinAccountId', 'name profilePicture')
            .sort('-scheduledAt');

        res.status(200).json({
            status: 'success',
            results: posts.length,
            data: { posts }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
