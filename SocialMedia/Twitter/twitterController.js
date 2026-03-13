const axios = require('axios');
const TwitterPost = require('../../models/TwitterPost');
const TwitterAccount = require('../../models/TwitterAccount');
const { scheduleTwitterPost } = require('../../src/queues/twitterQueue');
const crypto = require('crypto');

exports.getAuthUrl = (req, res) => {
    const clientId = process.env.TWITTER_CLIENT_ID;
    const redirectUri = process.env.TWITTER_REDIRECT_URI;
    const { serviceId } = req.query;

    const scope = ['tweet.read', 'tweet.write', 'users.read', 'offline.access'].join(' ');

    // Generate a secure random string for the code_verifier
    const codeVerifier = crypto.randomBytes(32).toString('base64url');

    // Hash it using SHA-256 and base64url encode it for the code_challenge
    const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');

    // Store the verifier in the state so we can use it in the callback
    const state = JSON.stringify({
        serviceId,
        platform: 'twitter',
        userId: req.user._id,
        codeVerifier // Store verifier in state to retrieve in callback
    });

    const url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(Buffer.from(state).toString('base64'))}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    res.status(200).json({ status: 'success', url });
};

exports.handleCallback = async (req, res) => {
    console.log('🔔 Twitter callback HIT!');
    try {
        const { code, state } = req.query;
        if (!code) {
            return res.status(400).json({ status: 'fail', message: 'No code provided' });
        }

        let codeVerifier = '';
        if (state) {
            try {
                // First decode URL encoding
                const uDecodedState = decodeURIComponent(state);
                // Decode base64 state
                const decodedState = Buffer.from(uDecodedState, 'base64').toString('utf-8');
                const parsedState = JSON.parse(decodedState);
                serviceId = parsedState.serviceId;
                userId = parsedState.userId;
                codeVerifier = parsedState.codeVerifier;
            } catch (e) {
                console.error('Error parsing state:', e);
            }
        }

        const clientId = process.env.TWITTER_CLIENT_ID;
        const clientSecret = process.env.TWITTER_CLIENT_SECRET;
        const redirectUri = process.env.TWITTER_REDIRECT_URI;

        // OAuth 2.0 Spec dictates URL encoding credentials before base64 encoding
        const encodedClientId = encodeURIComponent(clientId);
        const encodedClientSecret = encodeURIComponent(clientSecret);
        const authHeader = Buffer.from(`${encodedClientId}:${encodedClientSecret}`).toString('base64');

        const tokenRes = await axios.post('https://api.twitter.com/2/oauth2/token',
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                client_id: clientId,
                code_verifier: codeVerifier
            }).toString(),
            {
                // Basic auth for confidential client 
                auth: {
                    username: clientId,
                    password: clientSecret
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, refresh_token } = tokenRes.data;

        // Get user profile info
        const profileRes = await axios.get('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });

        const profile = profileRes.data.data;

        await TwitterAccount.findOneAndUpdate(
            { twitterId: profile.id },
            {
                userId: userId,
                twitterId: profile.id,
                name: profile.name,
                username: profile.username,
                accessToken: access_token,
                refreshToken: refresh_token || '',
                profilePicture: profile.profile_image_url || '',
                isActive: true
            },
            { upsert: true, new: true }
        );

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        if (serviceId) {
            return res.redirect(`${frontendUrl}/service-manager/${serviceId}?connected=twitter`);
        }

        res.redirect(`${frontendUrl}/my-services?connected=twitter`);
    } catch (err) {
        console.error('❌ Twitter Auth Error:', err.response?.data || err.message);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/my-services?error=twitter_connection_failed`);
    }
};

exports.getConnectedAccounts = async (req, res) => {
    try {
        const accounts = await TwitterAccount.find({ userId: req.user._id, isActive: true });
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
        const { twitterAccountId, text, mediaUrl, scheduledAt } = req.body;

        if (!twitterAccountId || !text || !scheduledAt) {
            return res.status(400).json({ status: 'fail', message: 'Missing required fields' });
        }

        const account = await TwitterAccount.findOne({ _id: twitterAccountId, userId: req.user._id });
        if (!account) {
            return res.status(404).json({ status: 'fail', message: 'Twitter account not found' });
        }

        const post = await TwitterPost.create({
            userId: req.user._id,
            twitterAccountId,
            text,
            mediaUrl,
            scheduledAt,
            status: 'scheduled'
        });

        await scheduleTwitterPost(post);

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
        const posts = await TwitterPost.find({ userId: req.user._id })
            .populate('twitterAccountId', 'name username profilePicture')
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
