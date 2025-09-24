const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/sequelize")

const LeaveType = sequelize.define("LeaveType", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  maxDaysPerYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "max_days_per_year",
  },
  carryForwardAllowed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: "carry_forward_allowed",
  },
  maxCarryForwardDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: "max_carry_forward_days",
  },
  requiresApproval: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: "requires_approval",
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: "is_paid",
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: "is_active",
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "created_at",
  },
}, {
  tableName: "leave_types",
  timestamps: false,
})

const LeaveRequest = sequelize.define("LeaveRequest", {
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
  leaveTypeId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: "leave_type_id",
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: "start_date",
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: "end_date",
  },
  totalDays: {
    type: DataTypes.DECIMAL(4,1),
    allowNull: false,
    field: "total_days",
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected", "cancelled"),
    allowNull: false,
    defaultValue: "pending",
  },
  appliedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "applied_at",
  },
  reviewedBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    field: "reviewed_by",
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "reviewed_at",
  },
  reviewComments: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "review_comments",
  },
  emergencyContact: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: "emergency_contact",
  },
  emergencyPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: "emergency_phone",
  },
  handoverNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "handover_notes",
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
  tableName: "leave_requests",
  timestamps: false,
})

const LeaveBalance = sequelize.define("LeaveBalance", {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: "user_id",
  },
  leaveTypeId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: "leave_type_id",
  },
  allocatedDays: {
    type: DataTypes.DECIMAL(4,1),
    allowNull: false,
    defaultValue: 0.0,
    field: "allocated_days",
  },
  usedDays: {
    type: DataTypes.DECIMAL(4,1),
    allowNull: false,
    defaultValue: 0.0,
    field: "used_days",
  },
  carriedForwardDays: {
    type: DataTypes.DECIMAL(4,1),
    allowNull: false,
    defaultValue: 0.0,
    field: "carried_forward_days",
  },
  remainingDays: {
    type: DataTypes.DECIMAL(4,1),
    allowNull: false,
    field: "remaining_days",
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "updated_at",
  },
}, {
  tableName: "leave_balances",
  timestamps: false,
})

const LeaveApproval = sequelize.define("LeaveApproval", {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
  },
  leaveRequestId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: "leave_request_id",
  },
  approverId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: "approver_id",
  },
  approvalLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "approval_level",
  },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    allowNull: false,
    defaultValue: "pending",
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "created_at",
  },
}, {
  tableName: "leave_approvals",
  timestamps: false,
})

LeaveType.hasMany(LeaveRequest, { foreignKey: "leave_type_id" })
LeaveRequest.belongsTo(LeaveType, { foreignKey: "leave_type_id" })

LeaveRequest.hasMany(LeaveApproval, { foreignKey: "leave_request_id" })
LeaveApproval.belongsTo(LeaveRequest, { foreignKey: "leave_request_id" })

LeaveType.hasMany(LeaveBalance, { foreignKey: "leave_type_id" })
LeaveBalance.belongsTo(LeaveType, { foreignKey: "leave_type_id" })

module.exports = {
  LeaveType,
  LeaveRequest,
  LeaveBalance,
  LeaveApproval,
}
