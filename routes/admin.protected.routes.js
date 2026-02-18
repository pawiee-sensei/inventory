const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

// ADMIN DASHBOARD PAGE
router.get('/dashboard', adminAuth, (req, res) => {
  res.render('admin/dashboard', {
    admin: req.session.admin
  });
});

// ADMIN SESSION CHECK (API)
router.get('/api/session', adminAuth, (req, res) => {
  res.json({
    authenticated: true,
    admin: req.session.admin
  });
});

module.exports = router;
