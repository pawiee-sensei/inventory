const express = require('express');
const router = express.Router();
const controller = require('../controllers/staff.stock.controller');
const staffAuth = require('../middleware/staffAuth');

router.post('/in', staffAuth, controller.stockIn);
router.post('/out', staffAuth, controller.stockOut);

module.exports = router;
