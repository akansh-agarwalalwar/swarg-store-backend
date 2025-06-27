const express = require('express');
const router = express.Router();
const youtubeVideoController = require('../controllers/youtubeVideoController');
const adminAuth = require('../middleware/adminAuth');

// Get all videos (public)
router.get('/', youtubeVideoController.getVideos);

// Add a video (admin/subadmin only)
router.post('/', adminAuth, youtubeVideoController.addVideo);

// Delete a video (admin/subadmin only)
router.delete('/:id', adminAuth, youtubeVideoController.deleteVideo);

module.exports = router; 