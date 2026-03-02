const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const controller = require('../controllers/admin.stock.controller');

router.post('/adjust', adminAuth, controller.adjustStock);
router.get('/history', adminAuth, controller.getHistory);

module.exports = router;