const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const controller = require('../controllers/admin.purchase.controller');

router.get('/suppliers', adminAuth, controller.getSuppliers);
router.post('/suppliers', adminAuth, controller.createSupplier);

router.post('/create', adminAuth, controller.createPO);
router.post('/add-item', adminAuth, controller.addItem);
router.get('/', adminAuth, controller.getAllPO);

module.exports = router;