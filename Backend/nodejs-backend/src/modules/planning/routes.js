const express = require("express")
const router = express.Router()
const planningController = require("./controller")

// Urban Plans
router.get("/urban-plans", planningController.getUrbanPlans.bind(planningController))
router.post("/urban-plans", planningController.createUrbanPlan.bind(planningController))
router.get("/urban-plans/:id", planningController.getUrbanPlanById.bind(planningController))
router.put("/urban-plans/:id", planningController.updateUrbanPlan.bind(planningController))
router.delete("/urban-plans/:id", planningController.deleteUrbanPlan.bind(planningController))
router.post("/urban-plans/:id/approve", planningController.approveUrbanPlan.bind(planningController))
router.post("/urban-plans/:id/archive", planningController.archiveUrbanPlan.bind(planningController))

// Projects
router.get("/projects", planningController.getProjects.bind(planningController))
router.post("/projects", planningController.createProject.bind(planningController))
router.get("/projects/:id", planningController.getProjectById.bind(planningController))
router.put("/projects/:id", planningController.updateProject.bind(planningController))
router.delete("/projects/:id", planningController.deleteProject.bind(planningController))
router.post("/projects/:projectId/milestones", planningController.addProjectMilestone.bind(planningController))
router.put("/projects/:projectId/milestones/:milestoneId", planningController.updateProjectMilestone.bind(planningController))
router.post("/projects/:id/complete", planningController.completeProject.bind(planningController))
router.post("/projects/:id/cancel", planningController.cancelProject.bind(planningController))

// Policies
router.get("/policies", planningController.getPolicies.bind(planningController))
router.post("/policies", planningController.createPolicy.bind(planningController))
router.get("/policies/:id", planningController.getPolicyById.bind(planningController))
router.put("/policies/:id", planningController.updatePolicy.bind(planningController))
router.delete("/policies/:id", planningController.deletePolicy.bind(planningController))
router.post("/policies/:id/approve", planningController.approvePolicy.bind(planningController))
router.post("/policies/:id/repeal", planningController.repealPolicy.bind(planningController))

// Strategic Goals
router.get("/strategic-goals", planningController.getStrategicGoals.bind(planningController))
router.post("/strategic-goals", planningController.createStrategicGoal.bind(planningController))
router.get("/strategic-goals/:id", planningController.getStrategicGoalById.bind(planningController))
router.put("/strategic-goals/:id", planningController.updateStrategicGoal.bind(planningController))
router.delete("/strategic-goals/:id", planningController.deleteStrategicGoal.bind(planningController))
router.post("/strategic-goals/:id/progress", planningController.updateGoalProgress.bind(planningController))
router.post("/strategic-goals/:id/achieve", planningController.achieveStrategicGoal.bind(planningController))

// Development Permits
router.get("/development-permits", planningController.getDevelopmentPermits.bind(planningController))
router.post("/development-permits", planningController.createDevelopmentPermit.bind(planningController))
router.get("/development-permits/:id", planningController.getDevelopmentPermitById.bind(planningController))
router.put("/development-permits/:id", planningController.updateDevelopmentPermit.bind(planningController))
router.delete("/development-permits/:id", planningController.deleteDevelopmentPermit.bind(planningController))
router.post("/development-permits/:id/approve", planningController.approveDevelopmentPermit.bind(planningController))
router.post("/development-permits/:id/reject", planningController.rejectDevelopmentPermit.bind(planningController))
router.post("/development-permits/:id/issue", planningController.issueDevelopmentPermit.bind(planningController))

// Reports and Analytics
router.get("/reports/overview", planningController.getPlanningReport.bind(planningController))
router.get("/analytics/project-progress", planningController.getProjectProgressAnalytics.bind(planningController))
router.get("/analytics/permit-processing", planningController.getPermitProcessingAnalytics.bind(planningController))
router.get("/analytics/goal-achievement", planningController.getGoalAchievementMetrics.bind(planningController))

module.exports = router
