const express = require("express")
const router = express.Router()
const planningController = require("./controller")

router.get("/urban-plans", planningController.getUrbanPlans.bind(planningController))
router.post("/urban-plans", planningController.createUrbanPlan.bind(planningController))
router.put("/urban-plans/:id", planningController.updateUrbanPlan.bind(planningController))
router.delete("/urban-plans/:id", planningController.deleteUrbanPlan.bind(planningController))

router.get("/projects", planningController.getProjects.bind(planningController))
router.post("/projects", planningController.createProject.bind(planningController))
router.put("/projects/:id", planningController.updateProject.bind(planningController))
router.delete("/projects/:id", planningController.deleteProject.bind(planningController))

router.get("/policies", planningController.getPolicies.bind(planningController))
router.post("/policies", planningController.createPolicy.bind(planningController))
router.put("/policies/:id", planningController.updatePolicy.bind(planningController))
router.delete("/policies/:id", planningController.deletePolicy.bind(planningController))

router.get("/strategic-goals", planningController.getStrategicGoals.bind(planningController))
router.post("/strategic-goals", planningController.createStrategicGoal.bind(planningController))
router.put("/strategic-goals/:id", planningController.updateStrategicGoal.bind(planningController))
router.delete("/strategic-goals/:id", planningController.deleteStrategicGoal.bind(planningController))

router.get("/development-permits", planningController.getDevelopmentPermits.bind(planningController))
router.post("/development-permits", planningController.createDevelopmentPermit.bind(planningController))
router.put("/development-permits/:id", planningController.updateDevelopmentPermit.bind(planningController))
router.delete("/development-permits/:id", planningController.deleteDevelopmentPermit.bind(planningController))

module.exports = router
