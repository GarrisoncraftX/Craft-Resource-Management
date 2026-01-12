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

const MaintenanceRecord = sequelize.define("MaintenanceRecord", {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  vehicleId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: "vehicle_id"
  },
  maintenanceType: {
    type: DataTypes.ENUM('routine', 'repair', 'emergency', 'inspection'),
    allowNull: false,
    field: "maintenance_type"
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  mileage: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  performedBy: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: "performed_by"
  },
  partsReplaced: {
    type: DataTypes.JSON,
    allowNull: true,
    field: "parts_replaced"
  },
  createdAt: {
    type: DataTypes.DATE,
    field: "created_at"
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: "updated_at"
  }
}, {
  tableName: "maintenance_records",
  timestamps: true
})

const FuelRecord = sequelize.define("FuelRecord", {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  vehicleId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: "vehicle_id"
  },
  driverId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: "driver_id"
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fuelType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: "fuel_type"
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  mileage: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  station: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    field: "created_at"
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: "updated_at"
  }
}, {
  tableName: "fuel_records",
  timestamps: true
})

Vehicle.hasMany(MaintenanceRecord, { foreignKey: "vehicle_id" })
MaintenanceRecord.belongsTo(Vehicle, { foreignKey: "vehicle_id" })

Vehicle.hasMany(FuelRecord, { foreignKey: "vehicle_id" })
FuelRecord.belongsTo(Vehicle, { foreignKey: "vehicle_id" })

Driver.hasMany(FuelRecord, { foreignKey: "driver_id" })
FuelRecord.belongsTo(Driver, { foreignKey: "driver_id" })

module.exports = {
  Vehicle,
  Driver,
  Trip,
  MaintenanceRecord,
  FuelRecord
}
