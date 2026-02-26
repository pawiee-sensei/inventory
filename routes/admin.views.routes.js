const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

router.get('/products', adminAuth, (req, res) => {
  res.render('admin/products');
});

router.get('/purchase', adminAuth, (req, res) => {
  res.render('admin/purchase');
});

module.exports = router;
