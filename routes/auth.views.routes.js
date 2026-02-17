const express = require('express');
const router = express.Router();

router.get('/admin/login', (req, res) => {
  res.render('auth/adminLogin');
});

router.get('/staff/login', (req, res) => {
  res.render('auth/staffLogin');
});

module.exports = router;
