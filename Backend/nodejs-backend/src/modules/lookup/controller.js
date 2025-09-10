const Permission = require('../auth/models/permission'); 
const Role = require('../auth/models/role');
const Department = require('./model');

const getDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll();
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRolePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const role = await Role.findByPk(roleId, {
      include: [{ model: Permission, as: 'permissions' }],
    });
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(role.permissions);
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getDepartments,
  getRoles,
  getRolePermissions,
};
