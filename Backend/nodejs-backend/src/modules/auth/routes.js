const express = require('express');
const authController = require('./controller');
const { validateToken } = require('../../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/signin', authController.signin);
router.post('/logout', authController.logout);
router.post('/hr/create-employee', validateToken, authController.hrCreateEmployee);

module.exports = router;
