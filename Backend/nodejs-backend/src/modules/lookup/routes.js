const express = require('express');
const lookupController = require('./controller');

const router = express.Router();

// Departments
router.get('/departments', lookupController.getDepartments);
router.post('/departments', lookupController.createDepartment);
router.get('/departments/search', lookupController.searchDepartments);
router.get('/departments/:id', lookupController.getDepartmentById);
router.put('/departments/:id', lookupController.updateDepartment);
router.delete('/departments/:id', lookupController.deleteDepartment);
router.post('/departments/:id/activate', lookupController.activateDepartment);
router.post('/departments/:id/deactivate', lookupController.deactivateDepartment);
router.get('/departments/:departmentId/roles', lookupController.getRolesByDepartment);
router.post('/departments/bulk', lookupController.bulkCreateDepartments);

// Roles
router.get('/roles', lookupController.getRoles);
router.post('/roles', lookupController.createRole);
router.get('/roles/search', lookupController.searchRoles);
router.get('/roles/:id', lookupController.getRoleById);
router.put('/roles/:id', lookupController.updateRole);
router.delete('/roles/:id', lookupController.deleteRole);
router.post('/roles/:id/activate', lookupController.activateRole);
router.post('/roles/:id/deactivate', lookupController.deactivateRole);
router.get('/roles/:roleId/permissions', lookupController.getRolePermissions);
router.post('/roles/:roleId/permissions', lookupController.assignPermissionsToRole);
router.delete('/roles/:roleId/permissions', lookupController.removePermissionsFromRole);
router.post('/roles/bulk', lookupController.bulkCreateRoles);

// Permissions
router.get('/permissions', lookupController.getPermissions);
router.post('/permissions', lookupController.createPermission);
router.get('/permissions/search', lookupController.searchPermissions);
router.get('/permissions/module/:module', lookupController.getPermissionsByModule);
router.get('/permissions/:id', lookupController.getPermissionById);
router.put('/permissions/:id', lookupController.updatePermission);
router.delete('/permissions/:id', lookupController.deletePermission);
router.post('/permissions/:id/activate', lookupController.activatePermission);
router.post('/permissions/:id/deactivate', lookupController.deactivatePermission);
router.post('/permissions/bulk', lookupController.bulkCreatePermissions);

// Bulk Operations
router.get('/all', lookupController.getAllLookupData);

module.exports = router;
