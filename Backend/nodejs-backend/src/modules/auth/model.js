const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sequelize');
const Role = require('./models/role');
const Permission = require('./models/permission');
const RolePermission = require('./models/rolePermission');
const Department = require('../lookup/model');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'employee_id',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'password',
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'first_name',
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'last_name',
  },
  middleName: {
    type: DataTypes.STRING,
    field: 'middle_name',
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    field: 'date_of_birth',
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'department_id',
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'role_id',
  },
  phone: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
  hireDate: {
    type: DataTypes.DATE,
    field: 'hire_date',
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2),
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  biometricEnrollmentStatus: {
    type: DataTypes.STRING,
    defaultValue: 'NONE',
    field: 'biometric_enrollment_status',
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: 'last_login',
  },
  failedLoginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'failed_login_attempts',
  },
  accountLockedUntil: {
    type: DataTypes.DATE,
    field: 'account_locked_until',
  },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Associations
User.belongsTo(Role, { foreignKey: 'roleId' });
Role.hasMany(User, { foreignKey: 'roleId' });

User.belongsTo(Department, { foreignKey: 'departmentId' });
Department.hasMany(User, { foreignKey: 'departmentId' });

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', otherKey: 'permissionId' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', otherKey: 'roleId' });

module.exports = User;
