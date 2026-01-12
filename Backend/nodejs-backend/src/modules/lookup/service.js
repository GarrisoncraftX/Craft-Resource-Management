const Department = require('./model');
const Role = require('../auth/models/role');
const Permission = require('../auth/models/permission');
const { Op } = require('sequelize');

class LookupService {
  // Departments
  async createDepartment(data) {
    return await Department.create(data);
  }

  async getDepartmentById(id) {
    return await Department.findByPk(id);
  }

  async getDepartments() {
    return await Department.findAll();
  }

  async updateDepartment(id, data) {
    const department = await Department.findByPk(id);
    if (!department) throw new Error('Department not found');
    return await department.update(data);
  }

  async deleteDepartment(id) {
    const department = await Department.findByPk(id);
    if (!department) throw new Error('Department not found');
    await department.destroy();
  }

  async activateDepartment(id) {
    const department = await Department.findByPk(id);
    if (!department) throw new Error('Department not found');
    return await department.update({ isActive: true });
  }

  async deactivateDepartment(id) {
    const department = await Department.findByPk(id);
    if (!department) throw new Error('Department not found');
    return await department.update({ isActive: false });
  }

  async searchDepartments(query) {
    return await Department.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { code: { [Op.like]: `%${query}%` } }
        ]
      }
    });
  }

  async getRolesByDepartment(departmentId) {
    return await Role.findAll({
      where: { departmentId }
    });
  }

  async bulkCreateDepartments(departments) {
    return await Department.bulkCreate(departments);
  }

  // Roles
  async createRole(data) {
    return await Role.create(data);
  }

  async getRoleById(id) {
    return await Role.findByPk(id, {
      include: [{ model: Permission, as: 'permissions' }]
    });
  }

  async getRoles() {
    return await Role.findAll({
      include: [{ model: Permission, as: 'permissions' }]
    });
  }

  async updateRole(id, data) {
    const role = await Role.findByPk(id);
    if (!role) throw new Error('Role not found');
    return await role.update(data);
  }

  async deleteRole(id) {
    const role = await Role.findByPk(id);
    if (!role) throw new Error('Role not found');
    await role.destroy();
  }

  async activateRole(id) {
    const role = await Role.findByPk(id);
    if (!role) throw new Error('Role not found');
    return await role.update({ isActive: true });
  }

  async deactivateRole(id) {
    const role = await Role.findByPk(id);
    if (!role) throw new Error('Role not found');
    return await role.update({ isActive: false });
  }

  async getRolePermissions(roleId) {
    const role = await Role.findByPk(roleId, {
      include: [{ model: Permission, as: 'permissions' }]
    });
    if (!role) throw new Error('Role not found');
    return role.permissions;
  }

  async assignPermissionsToRole(roleId, permissionIds) {
    const role = await Role.findByPk(roleId);
    if (!role) throw new Error('Role not found');
    await role.setPermissions(permissionIds);
    return await this.getRoleById(roleId);
  }

  async removePermissionsFromRole(roleId) {
    const role = await Role.findByPk(roleId);
    if (!role) throw new Error('Role not found');
    await role.setPermissions([]);
    return await this.getRoleById(roleId);
  }

  async searchRoles(query) {
    return await Role.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { code: { [Op.like]: `%${query}%` } }
        ]
      },
      include: [{ model: Permission, as: 'permissions' }]
    });
  }

  async bulkCreateRoles(roles) {
    return await Role.bulkCreate(roles);
  }

  // Permissions
  async createPermission(data) {
    return await Permission.create(data);
  }

  async getPermissionById(id) {
    return await Permission.findByPk(id);
  }

  async getPermissions() {
    return await Permission.findAll();
  }

  async updatePermission(id, data) {
    const permission = await Permission.findByPk(id);
    if (!permission) throw new Error('Permission not found');
    return await permission.update(data);
  }

  async deletePermission(id) {
    const permission = await Permission.findByPk(id);
    if (!permission) throw new Error('Permission not found');
    await permission.destroy();
  }

  async activatePermission(id) {
    const permission = await Permission.findByPk(id);
    if (!permission) throw new Error('Permission not found');
    return await permission.update({ isActive: true });
  }

  async deactivatePermission(id) {
    const permission = await Permission.findByPk(id);
    if (!permission) throw new Error('Permission not found');
    return await permission.update({ isActive: false });
  }

  async searchPermissions(query) {
    return await Permission.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { code: { [Op.like]: `%${query}%` } }
        ]
      }
    });
  }

  async getPermissionsByModule(module) {
    return await Permission.findAll({
      where: { module }
    });
  }

  async bulkCreatePermissions(permissions) {
    return await Permission.bulkCreate(permissions);
  }

  // Bulk Operations
  async getAllLookupData() {
    const [departments, roles, permissions] = await Promise.all([
      this.getDepartments(),
      this.getRoles(),
      this.getPermissions()
    ]);
    return { departments, roles, permissions };
  }
}

module.exports = LookupService;
