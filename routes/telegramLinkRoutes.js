const express = require('express');
const router = express.Router();
const telegramLinkController = require('../controllers/telegramLinkController');
const adminAuth = require('../middleware/adminAuth');

// Get all telegram links (public)
router.get('/', telegramLinkController.getLinks);

// Subadmin telegram link CRUD operations
router.get('/subadmin', adminAuth, telegramLinkController.getSubAdminLink);
router.post('/subadmin', adminAuth, telegramLinkController.createOrUpdateSubAdminLink);
router.delete('/subadmin', adminAuth, telegramLinkController.deleteSubAdminLink);

// Add a telegram link (admin/subadmin only)
router.post('/', adminAuth, telegramLinkController.addLink);

// Update a telegram link (admin/subadmin only)
router.put('/:id', adminAuth, telegramLinkController.updateLink);

// Delete a telegram link (admin/subadmin only)
router.delete('/:id', adminAuth, telegramLinkController.deleteLink);

module.exports = router;