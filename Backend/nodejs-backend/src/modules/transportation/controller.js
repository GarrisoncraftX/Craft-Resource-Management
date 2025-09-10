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
}

module.exports = new TransportationController()
