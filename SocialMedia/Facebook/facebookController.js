const axios = require('axios');
const FacebookAccount = require('../../models/FacebookAccount');
const FacebookPost = require('../../models/FacebookPost');
const { scheduleFacebookPost } = require('../../src/queues/facebookQueue');

// Initiates the Facebook Login OAuth
exports.getAuthUrl = (req, res) => {
    const appId = process.env.FACEBOOK_APP_ID;
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI;
    const { serviceId } = req.query;

    const scope = [
        'pages_read_engagement',
        'pages_show_list',
        'pages_manage_posts',
        'public_profile'
    ].join(',');

    const state = JSON.stringify({
        serviceId,
        userId: req.user._id
    });

    const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${encodeURIComponent(state)}&response_type=code&auth_type=rerequest`;

    res.status(200).json({
        status: 'success',
        url
    });
};

// Handles the callback from Facebook
exports.handleCallback = async (req, res) => {
    try {
        const { code, state, error, error_description } = req.query;

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        if (error || !code) {
            console.warn('Facebook OAuth cancelled or failed:', error_description || 'No code provided');
            return res.redirect(`${frontendUrl}/my-services?error=facebook_connection_failed`);
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

        if (!userId) {
            return res.status(400).json({ status: 'fail', message: 'User ID not found in state' });
        }

        const appId = process.env.FACEBOOK_APP_ID;
        const appSecret = process.env.FACEBOOK_APP_SECRET;
        const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

        // 1. Exchange code for short-lived access token via Facebook
        // (Both Facebook and Instagram Business flows use this for Graph API)
        const tokenRes = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
            params: {
                client_id: appId,
                client_secret: appSecret,
                redirect_uri: redirectUri,
                code
            }
        });

        const shortLivedToken = tokenRes.data.access_token;
        console.log('FB Short Lived Token received');

        // 2. Exchange for long-lived access token (valid for ~60 days)
        const longLivedTokenRes = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
            params: {
                grant_type: 'fb_exchange_token',
                client_id: appId,
                client_secret: appSecret,
                fb_exchange_token: shortLivedToken
            }
        });

        const accessToken = longLivedTokenRes.data.access_token;
        console.log('FB Long Lived Token received');

        // 3. Get User's Pages and their associated Instagram Accounts
        const pagesRes = await axios.get(`https://graph.facebook.com/v18.0/me/accounts`, {
            params: {
                access_token: accessToken,
                fields: 'id,name,access_token,category,picture{url},instagram_business_account{id,username,profile_picture_url}'
            }
        });

        console.log('FB Pages Graph API response:', JSON.stringify(pagesRes.data));

        const accounts = [];
        if (pagesRes.data.data && pagesRes.data.data.length > 0) {
            for (const page of pagesRes.data.data) {
                // A. Save the Facebook Page account
                const fbAccount = await FacebookAccount.findOneAndUpdate(
                    { facebookId: page.id },
                    {
                        userId: userId,
                        facebookId: page.id,
                        username: page.name,
                        accessToken: page.access_token, // Use Page Access Token!
                        facebookPageId: page.id,
                        profilePicture: page.picture?.data?.url || `https://graph.facebook.com/${page.id}/picture?type=large`,
                        isActive: true
                    },
                    { upsert: true, new: true }
                );
                accounts.push(fbAccount);

                // B. If it has a linked Instagram business account via FB flow, save that too
                if (page.instagram_business_account) {
                    const igAccount = page.instagram_business_account;

                    // For Instagram via FB flow, we store it in FacebookAccount model 
                    // but mark it with platform logic or handle it specifically
                    const account = await FacebookAccount.findOneAndUpdate(
                        { facebookId: igAccount.id },
                        {
                            userId: userId,
                            facebookId: igAccount.id,
                            username: igAccount.username,
                            accessToken: page.access_token, // IG via FB also uses Page token
                            facebookPageId: page.id,
                            profilePicture: igAccount.profile_picture_url,
                            isActive: true
                        },
                        { upsert: true, new: true }
                    );
                }
            }
        }

        // If no pages were found (or even if there were), grab the personal profile 
        // as a fallback so the user sees *something* connected in the database
        if (accounts.length === 0) {
            console.log('No Facebook Pages found. Fetching personal profile as a fallback...');
            const profileRes = await axios.get(`https://graph.facebook.com/v18.0/me`, {
                params: {
                    access_token: accessToken,
                    fields: 'id,name,picture{url}'
                }
            });

            const userProfile = profileRes.data;
            const fallbackAccount = await FacebookAccount.findOneAndUpdate(
                { facebookId: userProfile.id },
                {
                    userId: userId,
                    facebookId: userProfile.id,
                    username: userProfile.name + ' (Personal Profile)',
                    accessToken: accessToken, // Personal Access Token
                    facebookPageId: userProfile.id, // We use their ID as a placeholder
                    profilePicture: userProfile.picture?.data?.url || `https://graph.facebook.com/${userProfile.id}/picture?type=large`,
                    isActive: true
                },
                { upsert: true, new: true }
            );
            accounts.push(fallbackAccount);
        }

        // Redirect back to the specific service page if we have a serviceId
        if (serviceId) {
            return res.redirect(`${frontendUrl}/service-manager/${serviceId}?connected=facebook`);
        }

        // Fallback:
        res.redirect(`${frontendUrl}/my-services?connected=facebook`);
    } catch (err) {
        console.error('Facebook Auth Error:', err.response?.data || err.message);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/my-services?error=facebook_connection_failed`);
    }
};

// Get all connected Facebook accounts for current user
exports.getConnectedAccounts = async (req, res) => {
    try {
        const accounts = await FacebookAccount.find({ userId: req.user._id, isActive: true });
        res.status(200).json({
            status: 'success',
            results: accounts.length,
            data: { accounts }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Schedule a new post
exports.schedulePost = async (req, res) => {
    try {
        const { facebookAccountId, caption, mediaUrl, mediaType, scheduledAt } = req.body;

        if (!facebookAccountId || !caption || !mediaUrl || !scheduledAt) {
            return res.status(400).json({ status: 'fail', message: 'Missing required fields' });
        }

        const account = await FacebookAccount.findOne({ _id: facebookAccountId, userId: req.user._id });
        if (!account) {
            return res.status(404).json({ status: 'fail', message: 'Facebook account not found' });
        }

        // Facebook Graph API completely blocks automated posting to personal profiles.
        if (account.username.includes('(Personal Profile)')) {
            return res.status(400).json({
                status: 'fail',
                message: 'Facebook does not allow third-party apps to post to Personal Profiles. You must create and connect a public "Facebook Page".'
            });
        }

        const post = await FacebookPost.create({
            userId: req.user._id,
            facebookAccountId,
            caption,
            mediaUrl,
            mediaType: mediaType || 'IMAGE',
            scheduledAt,
            status: 'scheduled',
            platform: 'facebook'
        });

        // Add to Redis queue for scheduling
        await scheduleFacebookPost(post);

        res.status(201).json({
            status: 'success',
            data: { post }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Get scheduled posts
exports.getPosts = async (req, res) => {
    try {
        const posts = await FacebookPost.find({ userId: req.user._id, platform: 'facebook' })
            .populate('facebookAccountId', 'username profilePicture')
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

// Post immediately to Facebook
exports.postNow = async (req, res) => {
    try {
        const { facebookAccountId, caption, mediaUrl, mediaType } = req.body;
        if (!facebookAccountId || !caption || !mediaUrl) {
            return res.status(400).json({ status: 'fail', message: 'Missing required fields' });
        }
        const account = await FacebookAccount.findOne({ _id: facebookAccountId, userId: req.user._id });
        if (!account) return res.status(404).json({ status: 'fail', message: 'Account not found' });
        if (account.username.includes('(Personal Profile)')) {
            return res.status(400).json({ status: 'fail', message: 'Facebook blocks posting to Personal Profiles. Connect a Facebook Page.' });
        }
        const pageId = account.facebookPageId;
        const accessToken = account.accessToken;
        let fbPostId;
        if (mediaType === 'VIDEO') {
            const r = await axios.post(`https://graph.facebook.com/v18.0/${pageId}/videos`, { file_url: mediaUrl, description: caption, access_token: accessToken });
            fbPostId = r.data.id;
        } else {
            const r = await axios.post(`https://graph.facebook.com/v18.0/${pageId}/photos`, { url: mediaUrl, caption, access_token: accessToken });
            fbPostId = r.data.post_id || r.data.id;
        }
        const post = await FacebookPost.create({
            userId: req.user._id, facebookAccountId, caption, mediaUrl,
            mediaType: mediaType || 'IMAGE', scheduledAt: new Date(),
            status: 'posted', facebookPostId: fbPostId, platform: 'facebook'
        });
        res.status(201).json({ status: 'success', data: { post } });
    } catch (err) {
        console.error('FB Post Now Error:', err.response?.data || err.message);
        res.status(400).json({ status: 'fail', message: err.response?.data?.error?.message || err.message });
    }
};

// Delete a scheduled post
exports.deletePost = async (req, res) => {
    try {
        const post = await FacebookPost.findOne({ _id: req.params.id, userId: req.user._id });
        if (!post) return res.status(404).json({ status: 'fail', message: 'Post not found' });
        await FacebookPost.findByIdAndDelete(req.params.id);
        res.status(200).json({ status: 'success', data: null });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Reschedule a post
exports.reschedulePost = async (req, res) => {
    try {
        const { scheduledAt } = req.body;
        if (!scheduledAt) return res.status(400).json({ status: 'fail', message: 'scheduledAt is required' });
        const post = await FacebookPost.findOneAndUpdate(
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
