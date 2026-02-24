const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const controller = require('../controllers/admin.dashboard.controller');

router.get('/metrics', adminAuth, controller.getMetrics);

module.exports = router;