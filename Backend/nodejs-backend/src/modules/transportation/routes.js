const express = require("express")
const router = express.Router()
const transportationController = require("./controller")

router.get("/vehicles", transportationController.getVehicles.bind(transportationController))
router.post("/vehicles", transportationController.createVehicle.bind(transportationController))
router.put("/vehicles/:id", transportationController.updateVehicle.bind(transportationController))
router.delete("/vehicles/:id", transportationController.deleteVehicle.bind(transportationController))

router.get("/drivers", transportationController.getDrivers.bind(transportationController))
router.post("/drivers", transportationController.createDriver.bind(transportationController))
router.put("/drivers/:id", transportationController.updateDriver.bind(transportationController))
router.delete("/drivers/:id", transportationController.deleteDriver.bind(transportationController))

router.get("/trips", transportationController.getTrips.bind(transportationController))
router.post("/trips", transportationController.createTrip.bind(transportationController))
router.put("/trips/:id", transportationController.updateTrip.bind(transportationController))
router.delete("/trips/:id", transportationController.deleteTrip.bind(transportationController))

router.get("/maintenance-records", transportationController.getMaintenanceRecords.bind(transportationController))
router.post("/maintenance-records", transportationController.createMaintenanceRecord.bind(transportationController))
router.put("/maintenance-records/:id", transportationController.updateMaintenanceRecord.bind(transportationController))

router.get("/fuel-records", transportationController.getFuelRecords.bind(transportationController))
router.post("/fuel-records", transportationController.createFuelRecord.bind(transportationController))
router.put("/fuel-records/:id", transportationController.updateFuelRecord.bind(transportationController))

router.get("/reports/overview", transportationController.getTransportationReport.bind(transportationController))
router.get("/analytics/fuel-consumption", transportationController.getFuelConsumptionAnalytics.bind(transportationController))
router.get("/analytics/maintenance-schedule", transportationController.getMaintenanceScheduleAnalytics.bind(transportationController))
router.get("/analytics/driver-performance", transportationController.getDriverPerformanceAnalytics.bind(transportationController))
router.get("/analytics/vehicle-utilization", transportationController.getVehicleUtilizationAnalytics.bind(transportationController))
router.get("/analytics/fuel-efficiency", transportationController.getFuelEfficiencyAnalytics.bind(transportationController))

module.exports = router
