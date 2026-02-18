const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin.product.controller');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

router.get('/', adminAuth, controller.getAll);
router.post('/', adminAuth, controller.create);
router.post('/', adminAuth, upload.single('image'), controller.create);

module.exports = router;
