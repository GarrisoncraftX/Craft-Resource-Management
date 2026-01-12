const LookupService = require('./service');
const lookupService = new LookupService();

class LookupController {
  // Departments
  async createDepartment(req, res) {
    try {
      const department = await lookupService.createDepartment(req.body);
      res.status(201).json(department);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDepartmentById(req, res) {
    try {
      const department = await lookupService.getDepartmentById(req.params.id);
      if (!department) return res.status(404).json({ error: 'Department not found' });
      res.json(department);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDepartments(req, res) {
    try {
      const departments = await lookupService.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateDepartment(req, res) {
    try {
      const department = await lookupService.updateDepartment(req.params.id, req.body);
      res.json(department);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteDepartment(req, res) {
    try {
      await lookupService.deleteDepartment(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async activateDepartment(req, res) {
    try {
      const department = await lookupService.activateDepartment(req.params.id);
      res.json(department);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deactivateDepartment(req, res) {
    try {
      const department = await lookupService.deactivateDepartment(req.params.id);
      res.json(department);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async searchDepartments(req, res) {
    try {
      const departments = await lookupService.searchDepartments(req.query.q);
      res.json(departments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getRolesByDepartment(req, res) {
    try {
      const roles = await lookupService.getRolesByDepartment(req.params.departmentId);
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async bulkCreateDepartments(req, res) {
    try {
      const departments = await lookupService.bulkCreateDepartments(req.body.departments);
      res.status(201).json(departments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Roles
  async createRole(req, res) {
    try {
      const role = await lookupService.createRole(req.body);
      res.status(201).json(role);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getRoleById(req, res) {
    try {
      const role = await lookupService.getRoleById(req.params.id);
      if (!role) return res.status(404).json({ error: 'Role not found' });
      res.json(role);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getRoles(req, res) {
    try {
      const roles = await lookupService.getRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateRole(req, res) {
    try {
      const role = await lookupService.updateRole(req.params.id, req.body);
      res.json(role);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteRole(req, res) {
    try {
      await lookupService.deleteRole(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async activateRole(req, res) {
    try {
      const role = await lookupService.activateRole(req.params.id);
      res.json(role);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deactivateRole(req, res) {
    try {
      const role = await lookupService.deactivateRole(req.params.id);
      res.json(role);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getRolePermissions(req, res) {
    try {
      const permissions = await lookupService.getRolePermissions(req.params.roleId);
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async assignPermissionsToRole(req, res) {
    try {
      const role = await lookupService.assignPermissionsToRole(req.params.roleId, req.body.permissionIds);
      res.json(role);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async removePermissionsFromRole(req, res) {
    try {
      const role = await lookupService.removePermissionsFromRole(req.params.roleId);
      res.json(role);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async searchRoles(req, res) {
    try {
      const roles = await lookupService.searchRoles(req.query.q);
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async bulkCreateRoles(req, res) {
    try {
      const roles = await lookupService.bulkCreateRoles(req.body.roles);
      res.status(201).json(roles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Permissions
  async createPermission(req, res) {
    try {
      const permission = await lookupService.createPermission(req.body);
      res.status(201).json(permission);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPermissionById(req, res) {
    try {
      const permission = await lookupService.getPermissionById(req.params.id);
      if (!permission) return res.status(404).json({ error: 'Permission not found' });
      res.json(permission);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPermissions(req, res) {
    try {
      const permissions = await lookupService.getPermissions();
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updatePermission(req, res) {
    try {
      const permission = await lookupService.updatePermission(req.params.id, req.body);
      res.json(permission);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deletePermission(req, res) {
    try {
      await lookupService.deletePermission(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async activatePermission(req, res) {
    try {
      const permission = await lookupService.activatePermission(req.params.id);
      res.json(permission);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deactivatePermission(req, res) {
    try {
      const permission = await lookupService.deactivatePermission(req.params.id);
      res.json(permission);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async searchPermissions(req, res) {
    try {
      const permissions = await lookupService.searchPermissions(req.query.q);
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPermissionsByModule(req, res) {
    try {
      const permissions = await lookupService.getPermissionsByModule(req.params.module);
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async bulkCreatePermissions(req, res) {
    try {
      const permissions = await lookupService.bulkCreatePermissions(req.body.permissions);
      res.status(201).json(permissions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Bulk Operations
  async getAllLookupData(req, res) {
    try {
      const data = await lookupService.getAllLookupData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

const controller = new LookupController();

module.exports = {
  createDepartment: controller.createDepartment.bind(controller),
  getDepartmentById: controller.getDepartmentById.bind(controller),
  getDepartments: controller.getDepartments.bind(controller),
  updateDepartment: controller.updateDepartment.bind(controller),
  deleteDepartment: controller.deleteDepartment.bind(controller),
  activateDepartment: controller.activateDepartment.bind(controller),
  deactivateDepartment: controller.deactivateDepartment.bind(controller),
  searchDepartments: controller.searchDepartments.bind(controller),
  getRolesByDepartment: controller.getRolesByDepartment.bind(controller),
  bulkCreateDepartments: controller.bulkCreateDepartments.bind(controller),
  
  createRole: controller.createRole.bind(controller),
  getRoleById: controller.getRoleById.bind(controller),
  getRoles: controller.getRoles.bind(controller),
  updateRole: controller.updateRole.bind(controller),
  deleteRole: controller.deleteRole.bind(controller),
  activateRole: controller.activateRole.bind(controller),
  deactivateRole: controller.deactivateRole.bind(controller),
  getRolePermissions: controller.getRolePermissions.bind(controller),
  assignPermissionsToRole: controller.assignPermissionsToRole.bind(controller),
  removePermissionsFromRole: controller.removePermissionsFromRole.bind(controller),
  searchRoles: controller.searchRoles.bind(controller),
  bulkCreateRoles: controller.bulkCreateRoles.bind(controller),
  
  createPermission: controller.createPermission.bind(controller),
  getPermissionById: controller.getPermissionById.bind(controller),
  getPermissions: controller.getPermissions.bind(controller),
  updatePermission: controller.updatePermission.bind(controller),
  deletePermission: controller.deletePermission.bind(controller),
  activatePermission: controller.activatePermission.bind(controller),
  deactivatePermission: controller.deactivatePermission.bind(controller),
  searchPermissions: controller.searchPermissions.bind(controller),
  getPermissionsByModule: controller.getPermissionsByModule.bind(controller),
  bulkCreatePermissions: controller.bulkCreatePermissions.bind(controller),
  
  getAllLookupData: controller.getAllLookupData.bind(controller),
};
