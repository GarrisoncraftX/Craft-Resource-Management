const { DataTypes } = require("sequelize")
const { sequelize } = require("../../config/sequelize")

const Vehicle = sequelize.define("Vehicle", {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
  },
  make: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  licensePlate: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: "license_plate",
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: "active",
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
  tableName: "vehicles",
  timestamps: false,
})

const Driver = sequelize.define("Driver", {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: "first_name",
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: "last_name",
  },
  licenseNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: "license_number",
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: "active",
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
  tableName: "drivers",
  timestamps: false,
})

const Trip = sequelize.define("Trip", {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
  },
  vehicleId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: "vehicle_id",
  },
  driverId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: "driver_id",
  },
  startLocation: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: "start_location",
  },
  endLocation: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: "end_location",
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "start_time",
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "end_time",
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: "scheduled",
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
  tableName: "trips",
  timestamps: false,
})

// Associations
Vehicle.hasMany(Trip, { foreignKey: "vehicle_id" })
Trip.belongsTo(Vehicle, { foreignKey: "vehicle_id" })

Driver.hasMany(Trip, { foreignKey: "driver_id" })
Trip.belongsTo(Driver, { foreignKey: "driver_id" })

module.exports = {
  Vehicle,
  Driver,
  Trip,
}
