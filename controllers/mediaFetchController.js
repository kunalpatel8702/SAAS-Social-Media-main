const ytDlp = require('yt-dlp-exec');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const r2 = require('../src/config/r2');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

exports.fetchMediaUrl = async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ status: 'fail', message: 'No URL provided' });
        }

        // 1. Fetch metadata first to validate duration
        const metadata = await ytDlp(url, {
            dumpSingleJson: true,
            noWarnings: true,
        });

        const duration = metadata.duration || 0;
        if (duration > 90) {
            return res.status(400).json({
                status: 'fail',
                message: 'Video is too long. Maximum duration for Reels is 90 seconds.'
            });
        }

        // Generate a valid local temp filename
        const tmpDir = path.join(__dirname, '../../tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const fileId = uuidv4();
        const outputPath = path.join(tmpDir, `${fileId}.mp4`);

        // 2. Download the best mp4 format or convert to it
        await ytDlp(url, {
            output: outputPath,
            format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            mergeOutputFormat: 'mp4',
            noWarnings: true,
            maxFilesize: '100m', // Hard limit the download to 100MB roughly
        });

        if (!fs.existsSync(outputPath)) {
            throw new Error('Failed to download media from URL');
        }

        const fileBuffer = fs.readFileSync(outputPath);

        // Upload to R2 Custom Code (similar to multer config)
        const userId = req.user?._id || req.admin?._id || 'anon';
        const key = `uploads/videos/${userId}/${Date.now()}-${fileId}.mp4`;

        const uploadParams = {
            Bucket: process.env.CF_BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: 'video/mp4'
        };

        await r2.send(new PutObjectCommand(uploadParams));

        // Cleanup temp file
        fs.unlinkSync(outputPath);

        const publicUrl = `${process.env.CF_PUBLIC_URL}/${key}`;

        return res.status(200).json({
            status: 'success',
            url: publicUrl,
            key,
            mediaType: 'VIDEO' // Guessing based on the fact we target mp4
        });

    } catch (err) {
        console.error('Fetch Media URL Error:', err);
        return res.status(400).json({
            status: 'fail',
            message: err.message || 'Failed to fetch and process media from URL',
        });
    }
};
