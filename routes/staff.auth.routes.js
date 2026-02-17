const express = require('express');
const router = express.Router();
const controller = require('../controllers/staff.auth.controller');

router.post('/login', controller.login);
router.post('/logout', controller.logout);

module.exports = router;
