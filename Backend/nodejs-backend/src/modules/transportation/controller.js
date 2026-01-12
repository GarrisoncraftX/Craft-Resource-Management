const TransportationService = require("./service")
const transportationService = new TransportationService()

class TransportationController {
  async getVehicles(req, res, next) {
    try {
      const vehicles = await transportationService.getVehicles()
      res.json({ success: true, data: vehicles })
    } catch (error) {
      next(error)
    }
  }

  async createVehicle(req, res, next) {
    try {
      const vehicle = await transportationService.createVehicle(req.body)
      res.status(201).json({ success: true, data: vehicle })
    } catch (error) {
      next(error)
    }
  }

  async updateVehicle(req, res, next) {
    try {
      const id = req.params.id
      const updatedVehicle = await transportationService.updateVehicle(id, req.body)
      if (!updatedVehicle) {
        return res.status(404).json({ success: false, message: "Vehicle not found" })
      }
      res.json({ success: true, data: updatedVehicle })
    } catch (error) {
      next(error)
    }
  }

  async deleteVehicle(req, res, next) {
    try {
      const id = req.params.id
      await transportationService.deleteVehicle(id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  async getDrivers(req, res, next) {
    try {
      const drivers = await transportationService.getDrivers()
      res.json({ success: true, data: drivers })
    } catch (error) {
      next(error)
    }
  }

  async createDriver(req, res, next) {
    try {
      const driver = await transportationService.createDriver(req.body)
      res.status(201).json({ success: true, data: driver })
    } catch (error) {
      next(error)
    }
  }

  async updateDriver(req, res, next) {
    try {
      const id = req.params.id
      const updatedDriver = await transportationService.updateDriver(id, req.body)
      if (!updatedDriver) {
        return res.status(404).json({ success: false, message: "Driver not found" })
      }
      res.json({ success: true, data: updatedDriver })
    } catch (error) {
      next(error)
    }
  }

  async deleteDriver(req, res, next) {
    try {
      const id = req.params.id
      await transportationService.deleteDriver(id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  async getTrips(req, res, next) {
    try {
      const trips = await transportationService.getTrips()
      res.json({ success: true, data: trips })
    } catch (error) {
      next(error)
    }
  }

  async createTrip(req, res, next) {
    try {
      const trip = await transportationService.createTrip(req.body)
      res.status(201).json({ success: true, data: trip })
    } catch (error) {
      next(error)
    }
  }

  async updateTrip(req, res, next) {
    try {
      const id = req.params.id
      const updatedTrip = await transportationService.updateTrip(id, req.body)
      if (!updatedTrip) {
        return res.status(404).json({ success: false, message: "Trip not found" })
      }
      res.json({ success: true, data: updatedTrip })
    } catch (error) {
      next(error)
    }
  }

  async deleteTrip(req, res, next) {
    try {
      const id = req.params.id
      await transportationService.deleteTrip(id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  async getMaintenanceRecords(req, res, next) {
    try {
      const { vehicleId } = req.query
      const records = await transportationService.getMaintenanceRecords(vehicleId)
      res.json({ success: true, data: records })
    } catch (error) {
      next(error)
    }
  }

  async createMaintenanceRecord(req, res, next) {
    try {
      const record = await transportationService.createMaintenanceRecord(req.body)
      res.status(201).json({ success: true, data: record })
    } catch (error) {
      next(error)
    }
  }

  async updateMaintenanceRecord(req, res, next) {
    try {
      const id = req.params.id
      const record = await transportationService.updateMaintenanceRecord(id, req.body)
      res.json({ success: true, data: record })
    } catch (error) {
      next(error)
    }
  }

  async getFuelRecords(req, res, next) {
    try {
      const { vehicleId } = req.query
      const records = await transportationService.getFuelRecords(vehicleId)
      res.json({ success: true, data: records })
    } catch (error) {
      next(error)
    }
  }

  async createFuelRecord(req, res, next) {
    try {
      const record = await transportationService.createFuelRecord(req.body)
      res.status(201).json({ success: true, data: record })
    } catch (error) {
      next(error)
    }
  }

  async updateFuelRecord(req, res, next) {
    try {
      const id = req.params.id
      const record = await transportationService.updateFuelRecord(id, req.body)
      res.json({ success: true, data: record })
    } catch (error) {
      next(error)
    }
  }

  async getTransportationReport(req, res, next) {
    try {
      const report = await transportationService.getTransportationReport()
      res.json({ success: true, data: report })
    } catch (error) {
      next(error)
    }
  }

  async getFuelConsumptionAnalytics(req, res, next) {
    try {
      const analytics = await transportationService.getFuelConsumptionAnalytics()
      res.json({ success: true, data: analytics })
    } catch (error) {
      next(error)
    }
  }

  async getMaintenanceScheduleAnalytics(req, res, next) {
    try {
      const analytics = await transportationService.getMaintenanceScheduleAnalytics()
      res.json({ success: true, data: analytics })
    } catch (error) {
      next(error)
    }
  }

  async getDriverPerformanceAnalytics(req, res, next) {
    try {
      const analytics = await transportationService.getDriverPerformanceAnalytics()
      res.json({ success: true, data: analytics })
    } catch (error) {
      next(error)
    }
  }

  async getVehicleUtilizationAnalytics(req, res, next) {
    try {
      const analytics = await transportationService.getVehicleUtilizationAnalytics()
      res.json({ success: true, data: analytics })
    } catch (error) {
      next(error)
    }
  }

  async getFuelEfficiencyAnalytics(req, res, next) {
    try {
      const analytics = await transportationService.getFuelEfficiencyAnalytics()
      res.json({ success: true, data: analytics })
    } catch (error) {
      next(error)
    }
  }

  async getVehicleById(req, res, next) {
    try {
      const vehicle = await transportationService.getVehicleById(req.params.id)
      if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" })
      res.json({ success: true, data: vehicle })
    } catch (error) {
      next(error)
    }
  }

  async assignDriver(req, res, next) {
    try {
      const vehicle = await transportationService.assignDriver(req.params.vehicleId, req.body)
      if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" })
      res.json({ success: true, data: vehicle })
    } catch (error) {
      next(error)
    }
  }

  async unassignDriver(req, res, next) {
    try {
      const vehicle = await transportationService.unassignDriver(req.params.vehicleId, req.body)
      if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" })
      res.json({ success: true, data: vehicle })
    } catch (error) {
      next(error)
    }
  }

  async scheduleMaintenance(req, res, next) {
    try {
      const maintenance = await transportationService.scheduleMaintenance(req.params.vehicleId, req.body)
      res.status(201).json({ success: true, data: maintenance })
    } catch (error) {
      next(error)
    }
  }

  async retireVehicle(req, res, next) {
    try {
      const vehicle = await transportationService.retireVehicle(req.params.id, req.body)
      if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" })
      res.json({ success: true, data: vehicle })
    } catch (error) {
      next(error)
    }
  }

  async getDriverById(req, res, next) {
    try {
      const driver = await transportationService.getDriverById(req.params.id)
      if (!driver) return res.status(404).json({ success: false, message: "Driver not found" })
      res.json({ success: true, data: driver })
    } catch (error) {
      next(error)
    }
  }

  async assignVehicle(req, res, next) {
    try {
      const driver = await transportationService.assignVehicle(req.params.driverId, req.body)
      if (!driver) return res.status(404).json({ success: false, message: "Driver not found" })
      res.json({ success: true, data: driver })
    } catch (error) {
      next(error)
    }
  }

  async unassignVehicle(req, res, next) {
    try {
      const driver = await transportationService.unassignVehicle(req.params.driverId, req.body)
      if (!driver) return res.status(404).json({ success: false, message: "Driver not found" })
      res.json({ success: true, data: driver })
    } catch (error) {
      next(error)
    }
  }

  async suspendDriver(req, res, next) {
    try {
      const driver = await transportationService.suspendDriver(req.params.id, req.body)
      if (!driver) return res.status(404).json({ success: false, message: "Driver not found" })
      res.json({ success: true, data: driver })
    } catch (error) {
      next(error)
    }
  }

  async reactivateDriver(req, res, next) {
    try {
      const driver = await transportationService.reactivateDriver(req.params.id, req.body)
      if (!driver) return res.status(404).json({ success: false, message: "Driver not found" })
      res.json({ success: true, data: driver })
    } catch (error) {
      next(error)
    }
  }

  async getTripById(req, res, next) {
    try {
      const trip = await transportationService.getTripById(req.params.id)
      if (!trip) return res.status(404).json({ success: false, message: "Trip not found" })
      res.json({ success: true, data: trip })
    } catch (error) {
      next(error)
    }
  }

  async startTrip(req, res, next) {
    try {
      const trip = await transportationService.startTrip(req.params.id, req.body)
      if (!trip) return res.status(404).json({ success: false, message: "Trip not found" })
      res.json({ success: true, data: trip })
    } catch (error) {
      next(error)
    }
  }

  async completeTrip(req, res, next) {
    try {
      const trip = await transportationService.completeTrip(req.params.id, req.body)
      if (!trip) return res.status(404).json({ success: false, message: "Trip not found" })
      res.json({ success: true, data: trip })
    } catch (error) {
      next(error)
    }
  }

  async cancelTrip(req, res, next) {
    try {
      const trip = await transportationService.cancelTrip(req.params.id, req.body)
      if (!trip) return res.status(404).json({ success: false, message: "Trip not found" })
      res.json({ success: true, data: trip })
    } catch (error) {
      next(error)
    }
  }

  async getMaintenanceRecordById(req, res, next) {
    try {
      const record = await transportationService.getMaintenanceRecordById(req.params.id)
      if (!record) return res.status(404).json({ success: false, message: "Maintenance record not found" })
      res.json({ success: true, data: record })
    } catch (error) {
      next(error)
    }
  }

  async getFuelRecordById(req, res, next) {
    try {
      const record = await transportationService.getFuelRecordById(req.params.id)
      if (!record) return res.status(404).json({ success: false, message: "Fuel record not found" })
      res.json({ success: true, data: record })
    } catch (error) {
      next(error)
    }
  }

  async getMaintenanceCostAnalytics(req, res, next) {
    try {
      const analytics = await transportationService.getMaintenanceCostAnalytics()
      res.json({ success: true, data: analytics })
    } catch (error) {
      next(error)
    }
  }

  async getTripAnalytics(req, res, next) {
    try {
      const analytics = await transportationService.getTripAnalytics()
      res.json({ success: true, data: analytics })
    } catch (error) {
      next(error)
    }
  }

  async getRouteEfficiencyAnalytics(req, res, next) {
    try {
      const analytics = await transportationService.getRouteEfficiencyAnalytics()
      res.json({ success: true, data: analytics })
    } catch (error) {
      next(error)
    }
  }

  async getRoutes(req, res, next) {
    try {
      const routes = await transportationService.getRoutes()
      res.json({ success: true, data: routes })
    } catch (error) {
      next(error)
    }
  }

  async createRoute(req, res, next) {
    try {
      const route = await transportationService.createRoute(req.body)
      res.status(201).json({ success: true, data: route })
    } catch (error) {
      next(error)
    }
  }

  async updateRoute(req, res, next) {
    try {
      const id = req.params.id
      const route = await transportationService.updateRoute(id, req.body)
      if (!route) {
        return res.status(404).json({ success: false, message: "Route not found" })
      }
      res.json({ success: true, data: route })
    } catch (error) {
      next(error)
    }
  }

  async deleteRoute(req, res, next) {
    try {
      const id = req.params.id
      await transportationService.deleteRoute(id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new TransportationController()
