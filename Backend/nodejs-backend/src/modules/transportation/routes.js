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

module.exports = router
