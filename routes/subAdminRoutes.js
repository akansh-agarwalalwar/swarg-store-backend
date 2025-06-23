const express = require('express');
const router = express.Router();
const subAdminController = require('../controllers/subAdminController');
const adminAuth = require('../middleware/adminAuth');
const upload = require("../config/upload")
// Auth
router.post('/register', adminAuth, subAdminController.register);
router.post('/login', subAdminController.login);

// CRUD (admin only)
router.get('/', adminAuth, subAdminController.getAll,

    
) ;

router.get('/:id', adminAuth, subAdminController.getOne);
router.put('/:id', adminAuth, subAdminController.update);
router.delete('/:id', adminAuth, subAdminController.delete);

module.exports = router; 