const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/sequelize");

const PayrollHistory = sequelize.define("PayrollHistory", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: "user_id",
  },
  period: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  basicSalary: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: "basic_salary",
  },
  allowances: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  overtime: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  deductions: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  netPay: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: "net_pay",
  },
  status: {
    type: DataTypes.ENUM("Processed", "Pending", "Failed"),
    allowNull: false,
    defaultValue: "Processed",
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "created_at",
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "updated_at",
  },
}, {
  tableName: "payroll_history",
  timestamps: true,
});

module.exports = PayrollHistory;
