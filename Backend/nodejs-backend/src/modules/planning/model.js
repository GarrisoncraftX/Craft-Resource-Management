const { DataTypes } = require("sequelize")
const { sequelize } = require("../../config/sequelize")

const UrbanPlan = sequelize.define("UrbanPlan", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "start_date",
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "end_date",
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
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
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "updated_at",
  },
}, {
  tableName: "urban_plans",
  timestamps: false,
})

const Project = sequelize.define("Project", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "start_date",
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "end_date",
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
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
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "updated_at",
  },
}, {
  tableName: "projects",
  timestamps: false,
})

const Policy = sequelize.define("Policy", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  effectiveDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "effective_date",
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
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "updated_at",
  },
}, {
  tableName: "policies",
  timestamps: false,
})

const StrategicGoal = sequelize.define("StrategicGoal", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  goal: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  targetDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "target_date",
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
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "updated_at",
  },
}, {
  tableName: "strategic_goals",
  timestamps: false,
})

const DevelopmentPermit = sequelize.define("DevelopmentPermit", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  permitNumber: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: "permit_number",
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  issueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "issue_date",
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "expiry_date",
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
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
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "updated_at",
  },
}, {
  tableName: "development_permits",
  timestamps: false,
})

module.exports = {
  UrbanPlan,
  Project,
  Policy,
  StrategicGoal,
  DevelopmentPermit,
}
