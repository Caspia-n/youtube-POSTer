const express = require('express');
const router = express.Router();
const multer = require('multer');
const { apiKeyAuth } = require('../middleware/auth');
const youtubeService = require('../services/youtubeService');
const fs = require('fs');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 256 * 1024 * 1024, // 256 MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
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
    const metadata = {
      title: req.body.title,
      description: req.body.description,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      categoryId: req.body.categoryId,
      privacyStatus: req.body.privacyStatus || 'private',
      madeForKids: req.body.madeForKids === 'true',
    };

    // Create read stream for the uploaded file
    const videoStream = fs.createReadStream(req.file.path);

    // Upload to YouTube
    const result = await youtubeService.uploadVideo(videoStream, metadata);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

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
    // Clean up file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Error cleaning up file:', e);
      }
    }

    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload Failed',
      message: error.message,
    });
  }
});

module.exports = router;
