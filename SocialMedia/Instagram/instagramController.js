const axios = require('axios');
const InstagramPost = require('../../models/InstagramPost');
const InstagramAccount = require('../../models/InstagramAccount'); // Use dedicated model
const { scheduleInstagramPost } = require('../../src/queues/facebookQueue');

// Initiates the Instagram Login (via Native Instagram Auth endpoint)
exports.getAuthUrl = (req, res) => {
    // USE the Instagram-specific App ID here
    const appId = process.env.INSTAGRAM_APP_ID;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
    const { serviceId } = req.query;

    // NEW scope names required by "Instagram API with Instagram Login" (since Jan 2025)
    // Old names like 'instagram_basic' only work with Facebook Login flow
    const scope = [
        'instagram_business_basic',
        'instagram_business_content_publish',
        'instagram_business_manage_comments',
        'instagram_business_manage_messages'
    ].join(',');

    const state = JSON.stringify({
        serviceId,
        platform: 'instagram',
        userId: req.user._id // Pass user ID through state
    });

    // Using the NATIVE Instagram domain forces the Instagram login page to appear
    const url = `https://www.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${encodeURIComponent(state)}&response_type=code`;

    res.status(200).json({
        status: 'success',
        url
    });
};

// Handles the callback from Instagram
exports.handleCallback = async (req, res) => {
    console.log('🔔 Instagram callback HIT!');
    console.log('🔔 Query params:', JSON.stringify(req.query));
    try {
        const { code, state } = req.query;
        if (!code) {
            console.log('❌ No code in callback');
            return res.status(400).json({ status: 'fail', message: 'No code provided' });
        }
        console.log('✅ Code received:', code.substring(0, 20) + '...');

        let serviceId = '';
        let userId = '';
        if (state) {
            try {
                const parsedState = JSON.parse(state);
                serviceId = parsedState.serviceId;
                userId = parsedState.userId; // Extract user ID
            } catch (e) {
                console.error('Error parsing state:', e);
            }
        }

        if (!userId) {
            console.log('❌ No userId in state');
            return res.status(400).json({ status: 'fail', message: 'User ID not found in state' });
        }
        console.log('✅ Parsed state - userId:', userId, 'serviceId:', serviceId);

        const appId = process.env.INSTAGRAM_APP_ID;
        const appSecret = process.env.INSTAGRAM_APP_SECRET;
        const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

        console.log('🔄 Step 1: Exchanging code for token...');
        console.log('🔄 Using redirect_uri:', redirectUri);

        // 1. Exchange code for SHORT-LIVED token via Instagram's own endpoint (POST request)
        const tokenRes = await axios.post('https://api.instagram.com/oauth/access_token',
            new URLSearchParams({
                client_id: appId,
                client_secret: appSecret,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
                code
            }).toString(),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: 15000 // 15 second timeout
            }
        );

        const shortLivedToken = tokenRes.data.access_token;
        const instagramUserId = tokenRes.data.user_id;
        console.log('✅ Step 1 done - got short-lived token, IG user ID:', instagramUserId);

        // 2. Exchange for LONG-LIVED token via Graph API
        console.log('🔄 Step 2: Exchanging for long-lived token...');
        const longLivedTokenRes = await axios.get(`https://graph.instagram.com/access_token`, {
            params: {
                grant_type: 'ig_exchange_token',
                client_secret: appSecret,
                access_token: shortLivedToken
            },
            timeout: 15000
        });

        const accessToken = longLivedTokenRes.data.access_token;
        console.log('✅ Step 2 done - got long-lived token');

        // 3. Get user profile info (including profile_picture_url)
        console.log('🔄 Step 3: Fetching profile...');
        const profileRes = await axios.get(`https://graph.instagram.com/me`, {
            params: {
                fields: 'id,username,account_type,media_count,profile_picture_url',
                access_token: accessToken
            },
            timeout: 15000
        });

        const igProfile = profileRes.data;
        console.log('✅ Step 3 done - profile:', JSON.stringify(igProfile));

        // 4. Save or update the Instagram account in our database
        const account = await InstagramAccount.findOneAndUpdate(
            { instagramId: igProfile.id },
            {
                userId: userId,
                instagramId: igProfile.id,
                username: igProfile.username,
                accessToken: accessToken,
                facebookPageId: '', // Not available via Instagram direct login
                profilePicture: igProfile.profile_picture_url || '',
                isActive: true
            },
            { upsert: true, new: true }
        );

        console.log('✅ Instagram account connected:', igProfile.username);

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        if (serviceId) {
            return res.redirect(`${frontendUrl}/service-manager/${serviceId}?connected=instagram`);
        }

        res.redirect(`${frontendUrl}/my-services?connected=instagram`);
    } catch (err) {
        console.error('❌ Instagram Auth Error FULL:', err.response?.data || err.message);
        console.error('❌ Stack:', err.stack);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/my-services?error=instagram_connection_failed`);
    }
};

// Get connected Instagram accounts (refreshes profile pictures on every call)
exports.getConnectedAccounts = async (req, res) => {
    try {
        const accounts = await InstagramAccount.find({ userId: req.user._id, isActive: true });

        // Refresh profile picture URLs in parallel (they expire after a few hours)
        const refreshed = await Promise.all(
            accounts.map(async (acc) => {
                try {
                    const profileRes = await axios.get(`https://graph.instagram.com/me`, {
                        params: {
                            fields: 'id,username,profile_picture_url',
                            access_token: acc.accessToken
                        },
                        timeout: 8000
                    });
                    const freshPic = profileRes.data.profile_picture_url;
                    if (freshPic && freshPic !== acc.profilePicture) {
                        acc.profilePicture = freshPic;
                        await InstagramAccount.findByIdAndUpdate(acc._id, { profilePicture: freshPic });
                    }
                } catch (e) {
                    // If refresh fails (token expired etc.), keep existing URL silently
                    console.warn(`⚠️ Could not refresh profile pic for @${acc.username}:`, e.message);
                }
                return acc;
            })
        );

        res.status(200).json({
            status: 'success',
            results: refreshed.length,
            data: { accounts: refreshed }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};


// Instagram specific posting logic
exports.schedulePost = async (req, res) => {
    try {
        const { instagramAccountId, caption, mediaUrl, mediaType, scheduledAt } = req.body;

        if (!instagramAccountId || !caption || !mediaUrl || !scheduledAt) {
            return res.status(400).json({ status: 'fail', message: 'Missing required fields' });
        }

        const account = await InstagramAccount.findOne({ _id: instagramAccountId, userId: req.user._id });
        if (!account) {
            return res.status(404).json({ status: 'fail', message: 'Instagram account not found' });
        }

        const post = await InstagramPost.create({
            userId: req.user._id,
            instagramAccountId: instagramAccountId, // Reference to InstagramAccount
            caption,
            mediaUrl,
            mediaType: mediaType || 'IMAGE',
            scheduledAt,
            status: 'scheduled'
        });

        await scheduleInstagramPost(post);

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
        const posts = await InstagramPost.find({ userId: req.user._id })
            .populate('instagramAccountId', 'username profilePicture')
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

exports.postNow = async (req, res) => {
    try {
        const { instagramAccountId, caption, mediaUrl, mediaType } = req.body;

        if (!instagramAccountId || !caption || !mediaUrl) {
            return res.status(400).json({ status: 'fail', message: 'Missing required fields' });
        }

        const account = await InstagramAccount.findOne({ _id: instagramAccountId, userId: req.user._id });
        if (!account) {
            return res.status(404).json({ status: 'fail', message: 'Instagram account not found' });
        }

        const baseUrl = 'https://graph.instagram.com/v18.0';

        // 1. Create media container
        const containerParams = {
            access_token: account.accessToken,
            caption,
        };
        if (mediaType === 'VIDEO' || mediaType === 'REELS') {
            containerParams.video_url = mediaUrl;
            containerParams.media_type = 'REELS';
        } else {
            containerParams.image_url = mediaUrl;
        }

        const containerRes = await axios.post(
            `${baseUrl}/${account.instagramId}/media`,
            null,
            { params: containerParams }
        );
        const creationId = containerRes.data.id;

        // 2. Poll until FINISHED
        let isReady = false;
        let attempts = 0;
        while (!isReady && attempts < 20) {
            attempts++;
            const statusRes = await axios.get(`${baseUrl}/${creationId}`, {
                params: { fields: 'status_code,status', access_token: account.accessToken }
            });
            const statusCode = statusRes.data.status_code;
            if (statusCode === 'FINISHED') {
                isReady = true;
            } else if (statusCode === 'ERROR') {
                throw new Error(`Media processing failed: ${statusRes.data.status || 'Unknown error'}`);
            } else {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        if (!isReady) throw new Error('Media container timed out');

        // 3. Publish
        const publishRes = await axios.post(
            `${baseUrl}/${account.instagramId}/media_publish`,
            null,
            { params: { access_token: account.accessToken, creation_id: creationId } }
        );

        // 4. Save record as posted
        const post = await InstagramPost.create({
            userId: req.user._id,
            instagramAccountId,
            caption,
            mediaUrl,
            mediaType: mediaType || 'IMAGE',
            scheduledAt: new Date(),
            status: 'posted',
            instagramPostId: publishRes.data.id,
        });

        res.status(200).json({ status: 'success', data: { post, instagramPostId: publishRes.data.id } });
    } catch (err) {
        const message = err.response?.data?.error?.message || err.message;
        res.status(400).json({ status: 'fail', message });
    }
};

// Delete a scheduled post
exports.deletePost = async (req, res) => {
    try {
        const post = await InstagramPost.findOne({ _id: req.params.id, userId: req.user._id });
        if (!post) return res.status(404).json({ status: 'fail', message: 'Post not found' });
        await InstagramPost.findByIdAndDelete(req.params.id);
        res.status(200).json({ status: 'success', data: null });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Reschedule a post (update scheduledAt)
exports.reschedulePost = async (req, res) => {
    try {
        const { scheduledAt } = req.body;
        if (!scheduledAt) return res.status(400).json({ status: 'fail', message: 'scheduledAt is required' });
        const post = await InstagramPost.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id, status: { $in: ['scheduled', 'pending'] } },
            { scheduledAt },
            { new: true }
        );
        if (!post) return res.status(404).json({ status: 'fail', message: 'Post not found or already published' });
        res.status(200).json({ status: 'success', data: { post } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
