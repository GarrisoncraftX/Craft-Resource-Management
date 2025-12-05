const express = require('express');
const router = express.Router();
const communicationController = require('./controller');

router.post('/email', communicationController.sendEmail);

router.post('/sms', communicationController.sendSMS);

router.post('/notification', communicationController.sendNotification);

module.exports = router;
