const { Vehicle, Driver, Trip, MaintenanceRecord, FuelRecord } = require("./model")
const { Op } = require('sequelize')

class TransportationService {
  async getVehicles() {
    return await Vehicle.findAll({
      where: { status: "active" },
      order: [["createdAt", "DESC"]],
    })
  }

  async createVehicle(data) {
    const vehicle = await Vehicle.create({
      id: data.id,
      make: data.make,
      model: data.model,
      year: data.year,
      licensePlate: data.licensePlate,
      status: "active",
      createdAt: new Date(),
    })
    await auditService.logAction(data.userId, "CREATE_VEHICLE", {
      vehicleId: vehicle.id,
      licensePlate: data.licensePlate
    })
    return vehicle
  }

  async getVehicleById(id) {
    return await Vehicle.findByPk(id)
  }

  async updateVehicle(id, data) {
    const vehicle = await Vehicle.findByPk(id)
    if (!vehicle) return null
    vehicle.make = data.make
    vehicle.model = data.model
    vehicle.year = data.year
    vehicle.licensePlate = data.licensePlate
    await vehicle.save()
    await auditService.logAction(data.userId, "UPDATE_VEHICLE", {
      vehicleId: id,
      licensePlate: data.licensePlate
    })
    return vehicle
  }

  async deleteVehicle(id) {
    const vehicle = await Vehicle.findByPk(id)
    if (!vehicle) return null
    vehicle.status = "inactive"
    await vehicle.save()
    await auditService.logAction(null, "DELETE_VEHICLE", {
      vehicleId: id
    })
  }

  async getDrivers() {
    return await Driver.findAll({
      where: { status: "active" },
      order: [["createdAt", "DESC"]],
    })
  }

  async createDriver(data) {
    const driver = await Driver.create({
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      licenseNumber: data.licenseNumber,
      phone: data.phone,
      status: "active",
      createdAt: new Date(),
    })
    await auditService.logAction(data.userId, "CREATE_DRIVER", {
      driverId: driver.id,
      licenseNumber: data.licenseNumber
    })
    return driver
  }

  async getDriverById(id) {
    return await Driver.findByPk(id)
  }

  async updateDriver(id, data) {
    const driver = await Driver.findByPk(id)
    if (!driver) return null
    driver.firstName = data.firstName
    driver.lastName = data.lastName
    driver.licenseNumber = data.licenseNumber
    driver.phone = data.phone
    await driver.save()
    await auditService.logAction(data.userId, "UPDATE_DRIVER", {
      driverId: id,
      licenseNumber: data.licenseNumber
    })
    return driver
  }

  async deleteDriver(id) {
    const driver = await Driver.findByPk(id)
    if (!driver) return null
    driver.status = "inactive"
    await driver.save()
    await auditService.logAction(null, "DELETE_DRIVER", {
      driverId: id
    })
  }

  async getTrips() {
    return await Trip.findAll({
      order: [["startTime", "DESC"]],
      include: ["Vehicle", "Driver"],
    })
  }

  async createTrip(data) {
    const trip = await Trip.create({
      id: data.id,
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      startLocation: data.startLocation,
      endLocation: data.endLocation,
      startTime: data.startTime,
      endTime: data.endTime,
      status: "scheduled",
      createdAt: new Date(),
    })
    await auditService.logAction(data.userId, "CREATE_TRIP", {
      tripId: trip.id,
      startLocation: data.startLocation
    })
    return trip
  }

  async getTripById(id) {
    return await Trip.findByPk(id, {
      include: ["Vehicle", "Driver"],
    })
  }

  async updateTrip(id, data) {
    const trip = await Trip.findByPk(id)
    if (!trip) return null
    trip.vehicleId = data.vehicleId
    trip.driverId = data.driverId
    trip.startLocation = data.startLocation
    trip.endLocation = data.endLocation
    trip.startTime = data.startTime
    trip.endTime = data.endTime
    trip.status = data.status
    await trip.save()
    return trip
  }

  async deleteTrip(id) {
    const trip = await Trip.findByPk(id)
    if (!trip) return null
    trip.status = "cancelled"
    await trip.save()
    await auditService.logAction(null, "DELETE_TRIP", {
      tripId: id
    })
  }

  async getMaintenanceRecords(vehicleId) {
    const where = vehicleId ? { vehicleId } : {}
    return await MaintenanceRecord.findAll({ where, order: [["date", "DESC"]] })
  }

  async createMaintenanceRecord(data) {
    return await MaintenanceRecord.create(data)
  }

  async updateMaintenanceRecord(id, data) {
    const record = await MaintenanceRecord.findByPk(id)
    if (!record) return null
    await record.update(data)
    return record
  }

  async getFuelRecords(vehicleId) {
    const where = vehicleId ? { vehicleId } : {}
    return await FuelRecord.findAll({ where, order: [["date", "DESC"]] })
  }

  async createFuelRecord(data) {
    return await FuelRecord.create(data)
  }

  async updateFuelRecord(id, data) {
    const record = await FuelRecord.findByPk(id)
    if (!record) return null
    await record.update(data)
    return record
  }

  async getTransportationReport() {
    const totalVehicles = await Vehicle.count()
    const activeVehicles = await Vehicle.count({ where: { status: 'active' } })
    const totalDrivers = await Driver.count()
    const activeDrivers = await Driver.count({ where: { status: 'active' } })
    const totalTrips = await Trip.count()
    const completedTrips = await Trip.count({ where: { status: 'completed' } })
    const totalFuelCost = await FuelRecord.sum('cost') || 0
    const totalMaintenanceCost = await MaintenanceRecord.sum('cost') || 0

    return {
      totalVehicles,
      activeVehicles,
      totalDrivers,
      activeDrivers,
      totalTrips,
      completedTrips,
      totalFuelCost,
      totalMaintenanceCost
    }
  }

  async getFuelConsumptionAnalytics() {
    const records = await FuelRecord.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('date'), '%Y-%m'), 'month'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'consumption'],
        [sequelize.fn('SUM', sequelize.col('cost')), 'cost']
      ],
      group: ['month'],
      order: [[sequelize.col('month'), 'ASC']],
      limit: 6
    })
    return records
  }

  async getMaintenanceScheduleAnalytics() {
    const records = await MaintenanceRecord.findAll({
      attributes: [
        [sequelize.fn('WEEK', sequelize.col('date')), 'week'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'scheduled']
      ],
      group: ['week'],
      order: [[sequelize.col('week'), 'DESC']],
      limit: 4
    })
    return records
  }

  async getDriverPerformanceAnalytics() {
    return []
  }

  async getVehicleUtilizationAnalytics() {
    return []
  }

  async getFuelEfficiencyAnalytics() {
    return []
  }
}

module.exports = TransportationService
