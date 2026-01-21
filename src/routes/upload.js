const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { apiKeyAuth } = require('../middleware/auth');
const youtubeService = require('../services/youtubeService');
const fs = require('fs').promises;

// Accepted video file extensions (YouTube supported formats)
const ACCEPTED_VIDEO_EXTENSIONS = [
  '.mp4', '.mov', '.avi', '.flv', '.wmv', '.mpg', '.mpeg',
  '.3gp', '.webm', '.mkv', '.m4v', '.asf', '.vob', '.ogv'
];

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 256 * 1024 * 1024, // 256 MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept video files based on MIME type or file extension
    // Check MIME type first
    if (file.mimetype.startsWith('video/')) {
      return cb(null, true);
    }
    
    // Fallback to file extension check for clients that don't set correct MIME type
    if (file.originalname) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (ACCEPTED_VIDEO_EXTENSIONS.includes(ext)) {
        return cb(null, true);
      }
    }
    
    cb(new Error('Only video files are allowed'));
  },
});

// Upload video endpoint
router.post('/video', apiKeyAuth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Video file is required',
      });
    }

    // Parse metadata from request body
    let tags = [];
    if (req.body.tags) {
      try {
        tags = JSON.parse(req.body.tags);
      } catch (e) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid JSON format for tags parameter',
        });
      }
    }

    const metadata = {
      title: req.body.title,
      description: req.body.description,
      tags,
      categoryId: req.body.categoryId,
      privacyStatus: req.body.privacyStatus || 'private',
      madeForKids: req.body.madeForKids === 'true',
    };

    // Create read stream for the uploaded file
    const videoStream = require('fs').createReadStream(req.file.path);

    // Upload to YouTube
    const result = await youtubeService.uploadVideo(videoStream, metadata);

    // Clean up uploaded file (async)
    await fs.unlink(req.file.path).catch(err => {
      console.error('Error deleting uploaded file:', err);
    });

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      video: {
        id: result.id,
        title: result.snippet.title,
        description: result.snippet.description,
        privacyStatus: result.status.privacyStatus,
        url: `https://www.youtube.com/watch?v=${result.id}`,
      },
    });
  } catch (error) {
    // Clean up file on error (async)
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(err => {
        console.error('Error cleaning up file:', err);
      });
    }

    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload Failed',
      message: error.message,
    });
  }
});

module.exports = router;
