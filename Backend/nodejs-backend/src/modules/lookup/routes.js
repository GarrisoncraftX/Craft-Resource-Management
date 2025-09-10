const express = require('express');
const lookupController = require('./controller');


const router = express.Router();

router.get('/departments', lookupController.getDepartments);
router.get('/roles', lookupController.getRoles);
router.get('/roles/:roleId/permissions', lookupController.getRolePermissions);

module.exports = router;
