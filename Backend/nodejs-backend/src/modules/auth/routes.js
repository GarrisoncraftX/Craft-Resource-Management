const express = require('express');
const authController = require('./controller');

const router = express.Router();

router.post('/register', authController.register);
router.post('/signin', authController.signin);
router.post('/logout', authController.logout);

module.exports = router;
