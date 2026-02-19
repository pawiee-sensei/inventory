const express = require('express');
const router = express.Router();

const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const controller = require('../controllers/admin.product.controller');

// GET ALL PRODUCTS
router.get('/', adminAuth, controller.getAll);

// CREATE PRODUCT (MULTER MUST RUN BEFORE CONTROLLER)
router.post(
  '/',
  adminAuth,
  upload.single('image'),   // ← THIS MUST BE HERE
  controller.create
);

module.exports = router;
