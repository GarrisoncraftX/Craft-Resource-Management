const { Vehicle, Driver, Trip } = require("./model")

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
    return vehicle
  }

  async deleteVehicle(id) {
    const vehicle = await Vehicle.findByPk(id)
    if (!vehicle) return null
    vehicle.status = "inactive"
    await vehicle.save()
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
    return driver
  }

  async deleteDriver(id) {
    const driver = await Driver.findByPk(id)
    if (!driver) return null
    driver.status = "inactive"
    await driver.save()
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
  }
}

module.exports = TransportationService
