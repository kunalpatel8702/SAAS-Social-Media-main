const videoGenerator = require('../services/videoGenerator');
const Video = require('../models/Video');
const VOICE_OPTIONS = require('../services/voiceConfig');
const path = require('path');
const fs = require('fs');

/** Helper for generating absolute URLs for local files */
const getPublicUrl = (req, filePath) => {
    if (!filePath || !filePath.startsWith('/public')) return filePath;
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    return `${protocol}://${host}${filePath}`;
};

exports.generateVideo = async (req, res) => {
    try {
        const { prompt, voiceId, duration, aspectRatio = '9:16' } = req.body;
        if (!prompt) {
            return res.status(400).json({ success: false, message: 'Prompt is required' });
        }

        if (!duration) {
            return res.status(400).json({ success: false, message: 'Please select a video duration (15s, 20s, 30s, or 40s)' });
        }

        const validDuration = [15, 20, 30, 40].includes(Number(duration)) ? Number(duration) : 30;
        const validAspectRatio = ['9:16', '16:9'].includes(aspectRatio) ? aspectRatio : '9:16';

        const result = await videoGenerator.generateVideo(prompt, voiceId || null, validDuration, validAspectRatio);

        // Save to DB
        const video = await Video.create({
            user: req.user._id,
            prompt,
            voiceId: voiceId || null,
            renderId: result.renderId,
            status: result.status,
            duration: validDuration,
            metadata: {
                duration: validDuration,
                aspectRatio: validAspectRatio
            }
        });

        res.status(200).json({
            success: true,
            message: 'Video generation initialized',
            data: {
                ...result,
                videoId: video._id
            }
        });
    } catch (error) {
        console.error('Video Generation Error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.getVideoStatus = async (req, res) => {
    try {
        const { renderId } = req.params;
        const status = await videoGenerator.checkStatus(renderId);

        let url = status.url;
        // Archive locally once done
        if (status.status === 'done' && url && url.includes('shotstack')) {
            url = await videoGenerator.storeFinalVideo(url, renderId);
        }

        const updateData = { status: status.status };
        if (url) updateData.videoUrl = url;

        await Video.findOneAndUpdate({ renderId }, updateData);

        if (status.status === 'failed') {
            console.error('--- SHOTSTACK RENDER FAILED ---', JSON.stringify(status, null, 2));
        }

        res.status(200).json({
            success: true,
            data: { ...status, url: getPublicUrl(req, url) }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getUserVideos = async (req, res) => {
    try {
        const videos = await Video.find({ user: req.user._id }).sort({ createdAt: -1 });

        // Return absolute URLs to frontend
        const result = await Promise.all(videos.map(async v => {
            const video = v.toObject();
            let url = video.videoUrl;

            // Auto-archive expired/old Shotstack links if viewed
            if (url && url.includes('shotstack') && video.status === 'done') {
                const localPath = await videoGenerator.storeFinalVideo(url, video.renderId);
                if (localPath.startsWith('/public')) {
                    url = localPath;
                    await Video.findByIdAndUpdate(video._id, { videoUrl: localPath });
                }
            }

            return { ...video, videoUrl: getPublicUrl(req, url) };
        }));

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getVoiceOptions = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: VOICE_OPTIONS
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getPublicVideos = async (req, res) => {
    try {
        // Get the 6 most recent successfully completed and published videos
        const videos = await Video.find({ status: 'done', videoUrl: { $ne: null }, isActive: true })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(6);

        const result = videos.map(v => {
            const video = v.toObject();
            return {
                _id: video._id,
                prompt: video.prompt,
                videoUrl: getPublicUrl(req, video.videoUrl),
                thumbnailUrl: video.thumbnailUrl ? getPublicUrl(req, video.thumbnailUrl) : null,
                duration: video.duration,
                aspectRatio: video.metadata?.aspectRatio || '9:16',
                createdAt: video.createdAt,
                userName: video.user?.name || 'Anonymous User'
            };
        });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.downloadVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const video = await Video.findOne({ _id: videoId, user: req.user._id });

        if (!video || !video.videoUrl) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }

        const filename = `ai-video-${videoId}.mp4`;
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // 1. If it's a local file path
        if (video.videoUrl.startsWith('/public')) {
            const fs = require('fs');
            const path = require('path');
            const localPath = path.join(__dirname, '..', video.videoUrl);

            if (!fs.existsSync(localPath)) {
                return res.status(404).json({ success: false, message: 'Local video file not found' });
            }

            const stats = fs.statSync(localPath);
            res.setHeader('Content-Length', stats.size);
            return fs.createReadStream(localPath).pipe(res);
        }

        // 2. If it's an external URL (fallback/old videos)
        const axios = require('axios');
        const response = await axios.get(video.videoUrl, {
            responseType: 'stream',
            timeout: 60000
        });

        if (response.headers['content-length']) {
            res.setHeader('Content-Length', response.headers['content-length']);
        }

        response.data.pipe(res);
    } catch (error) {
        console.error('Download proxy error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to download video'
        });
    }
};
