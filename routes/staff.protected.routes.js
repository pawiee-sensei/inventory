const express = require('express');
const router = express.Router();
const staffAuth = require('../middleware/staffAuth');

router.get('/app/dashboard', staffAuth, (req, res) => {
  res.render('staff/dashboard', {
    staff: req.session.staff
  });
});

router.get('/app/api/session', staffAuth, (req, res) => {
  res.json({
    authenticated: true,
    staff: req.session.staff
  });
});

module.exports = router;
