const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/sequelize');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'roles',
  timestamps: false,
});

module.exports = Role;
