const express = require('express');
const router = express.Router();
const staffAuth = require('../middleware/staffAuth');

router.get('/stock', staffAuth, (req, res) => {
  res.render('staff/stock');
});

module.exports = router;
