const express = require("express")
const router = express.Router()
const transportationController = require("./controller")

// Vehicles
router.get("/vehicles", transportationController.getVehicles.bind(transportationController))
router.post("/vehicles", transportationController.createVehicle.bind(transportationController))
router.get("/vehicles/:id", transportationController.getVehicleById.bind(transportationController))
router.put("/vehicles/:id", transportationController.updateVehicle.bind(transportationController))
router.delete("/vehicles/:id", transportationController.deleteVehicle.bind(transportationController))
router.post("/vehicles/:vehicleId/assign-driver", transportationController.assignDriver.bind(transportationController))
router.post("/vehicles/:vehicleId/unassign-driver", transportationController.unassignDriver.bind(transportationController))
router.post("/vehicles/:vehicleId/schedule-maintenance", transportationController.scheduleMaintenance.bind(transportationController))
router.post("/vehicles/:id/retire", transportationController.retireVehicle.bind(transportationController))

// Drivers
router.get("/drivers", transportationController.getDrivers.bind(transportationController))
router.post("/drivers", transportationController.createDriver.bind(transportationController))
router.get("/drivers/:id", transportationController.getDriverById.bind(transportationController))
router.put("/drivers/:id", transportationController.updateDriver.bind(transportationController))
router.delete("/drivers/:id", transportationController.deleteDriver.bind(transportationController))
router.post("/drivers/:driverId/assign-vehicle", transportationController.assignVehicle.bind(transportationController))
router.post("/drivers/:driverId/unassign-vehicle", transportationController.unassignVehicle.bind(transportationController))
router.post("/drivers/:id/suspend", transportationController.suspendDriver.bind(transportationController))
router.post("/drivers/:id/reactivate", transportationController.reactivateDriver.bind(transportationController))

// Trips
router.get("/trips", transportationController.getTrips.bind(transportationController))
router.post("/trips", transportationController.createTrip.bind(transportationController))
router.get("/trips/:id", transportationController.getTripById.bind(transportationController))
router.put("/trips/:id", transportationController.updateTrip.bind(transportationController))
router.delete("/trips/:id", transportationController.deleteTrip.bind(transportationController))
router.post("/trips/:id/start", transportationController.startTrip.bind(transportationController))
router.post("/trips/:id/complete", transportationController.completeTrip.bind(transportationController))
router.post("/trips/:id/cancel", transportationController.cancelTrip.bind(transportationController))

// Maintenance Records
router.get("/maintenance-records", transportationController.getMaintenanceRecords.bind(transportationController))
router.post("/maintenance-records", transportationController.createMaintenanceRecord.bind(transportationController))
router.get("/maintenance-records/:id", transportationController.getMaintenanceRecordById.bind(transportationController))
router.put("/maintenance-records/:id", transportationController.updateMaintenanceRecord.bind(transportationController))

// Fuel Records
router.get("/fuel-records", transportationController.getFuelRecords.bind(transportationController))
router.post("/fuel-records", transportationController.createFuelRecord.bind(transportationController))
router.get("/fuel-records/:id", transportationController.getFuelRecordById.bind(transportationController))
router.put("/fuel-records/:id", transportationController.updateFuelRecord.bind(transportationController))

// Routes Management
router.get("/routes", transportationController.getRoutes.bind(transportationController))
router.post("/routes", transportationController.createRoute.bind(transportationController))
router.put("/routes/:id", transportationController.updateRoute.bind(transportationController))
router.delete("/routes/:id", transportationController.deleteRoute.bind(transportationController))

// Reports and Analytics
router.get("/reports/overview", transportationController.getTransportationReport.bind(transportationController))
router.get("/analytics/vehicle-utilization", transportationController.getVehicleUtilizationAnalytics.bind(transportationController))
router.get("/analytics/fuel-consumption", transportationController.getFuelConsumptionAnalytics.bind(transportationController))
router.get("/analytics/maintenance-cost", transportationController.getMaintenanceCostAnalytics.bind(transportationController))
router.get("/analytics/trips", transportationController.getTripAnalytics.bind(transportationController))
router.get("/analytics/driver-performance", transportationController.getDriverPerformanceAnalytics.bind(transportationController))
router.get("/analytics/maintenance-schedule", transportationController.getMaintenanceScheduleAnalytics.bind(transportationController))
router.get("/analytics/fuel-efficiency", transportationController.getFuelEfficiencyAnalytics.bind(transportationController))
router.get("/analytics/route-efficiency", transportationController.getRouteEfficiencyAnalytics.bind(transportationController))

module.exports = router
