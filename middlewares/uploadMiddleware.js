const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const r2 = require('../src/config/r2');

// Allowed MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-m4v'];
const MAX_SIZE_MB = 8;
const MAX_VIDEO_SIZE_MB = 100;

const fileFilter = (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, and WebP images are allowed.'), false);
    }
};

const videoFileFilter = (req, file, cb) => {
    if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only MP4, MOV, and M4V videos are allowed.'), false);
    }
};

// Lazy singleton – created on first use so that dotenv has already loaded CF_BUCKET_NAME
let _upload = null;
const getUpload = () => {
    if (!_upload) {
        _upload = multer({
            fileFilter,
            limits: {
                fileSize: MAX_SIZE_MB * 1024 * 1024, // 8 MB
            },
            storage: multerS3({
                s3: r2,
                bucket: process.env.CF_BUCKET_NAME,
                contentType: multerS3.AUTO_CONTENT_TYPE,
                metadata: (req, file, cb) => {
                    cb(null, { fieldName: file.fieldname });
                },
                key: (req, file, cb) => {
                    // Path: uploads/{userId}/{timestamp}-{sanitisedFilename}
                    const userId = req.user?._id || req.admin?._id || 'anon';
                    const ext = path.extname(file.originalname).toLowerCase();
                    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
                    const key = `uploads/${userId}/${Date.now()}-${safeBase}${ext}`;
                    cb(null, key);
                },
            }),
        });
    }
    return _upload;
};

let _videoUpload = null;
const getVideoUpload = () => {
    if (!_videoUpload) {
        _videoUpload = multer({
            fileFilter: videoFileFilter,
            limits: {
                fileSize: MAX_VIDEO_SIZE_MB * 1024 * 1024, // 100 MB
            },
            storage: multerS3({
                s3: r2,
                bucket: process.env.CF_BUCKET_NAME,
                contentType: multerS3.AUTO_CONTENT_TYPE,
                metadata: (req, file, cb) => {
                    cb(null, { fieldName: file.fieldname });
                },
                key: (req, file, cb) => {
                    const userId = req.user?._id || req.admin?._id || 'anon';
                    const ext = path.extname(file.originalname).toLowerCase();
                    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
                    const key = `uploads/videos/${userId}/${Date.now()}-${safeBase}${ext}`;
                    cb(null, key);
                },
            }),
        });
    }
    return _videoUpload;
};

module.exports = { getUpload, getVideoUpload };

