const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

router.get('/products', adminAuth, (req, res) => {
  res.render('admin/products');
});

module.exports = router;
