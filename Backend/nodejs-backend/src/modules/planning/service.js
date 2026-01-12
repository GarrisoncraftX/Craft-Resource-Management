const {
  UrbanPlan,
  Project,
  Policy,
  StrategicGoal,
  DevelopmentPermit,
} = require("./model")
const auditService = require("../audit/service")

class PlanningService {
  async getUrbanPlans() {
    return await UrbanPlan.findAll({
      where: { isActive: true },
      order: [["startDate", "DESC"]],
    })
  }

  async createUrbanPlan(data) {
    const urbanPlan = await UrbanPlan.create({
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      isActive: true,
      createdAt: new Date(),
    })
    await auditService.logAction(data.userId, "CREATE_URBAN_PLAN", {
      urbanPlanId: urbanPlan.id,
      name: data.name
    })
    return urbanPlan
  }

  async getUrbanPlanById(id) {
    return await UrbanPlan.findByPk(id)
  }

  async updateUrbanPlan(id, data) {
    const urbanPlan = await UrbanPlan.findByPk(id)
    if (!urbanPlan) return null
    urbanPlan.name = data.name
    urbanPlan.description = data.description
    urbanPlan.startDate = data.startDate
    urbanPlan.endDate = data.endDate
    urbanPlan.status = data.status
    await urbanPlan.save()
    await auditService.logAction(data.userId, "UPDATE_URBAN_PLAN", {
      urbanPlanId: id,
      name: data.name
    })
    return urbanPlan
  }

  async deleteUrbanPlan(id) {
    const urbanPlan = await UrbanPlan.findByPk(id)
    if (!urbanPlan) return null
    urbanPlan.isActive = false
    await urbanPlan.save()
    await auditService.logAction(null, "DELETE_URBAN_PLAN", {
      urbanPlanId: id
    })
  }

  async getProjects() {
    return await Project.findAll({
      where: { isActive: true },
      order: [["startDate", "DESC"]],
    })
  }

  async createProject(data) {
    const project = await Project.create({
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      isActive: true,
      createdAt: new Date(),
    })
    await auditService.logAction(data.userId, "CREATE_PROJECT", {
      projectId: project.id,
      name: data.name
    })
    return project
  }

  async getProjectById(id) {
    return await Project.findByPk(id)
  }

  async updateProject(id, data) {
    const project = await Project.findByPk(id)
    if (!project) return null
    project.name = data.name
    project.description = data.description
    project.startDate = data.startDate
    project.endDate = data.endDate
    project.status = data.status
    await project.save()
    await auditService.logAction(data.userId, "UPDATE_PROJECT", {
      projectId: id,
      name: data.name
    })
    return project
  }

  async deleteProject(id) {
    const project = await Project.findByPk(id)
    if (!project) return null
    project.isActive = false
    await project.save()
    await auditService.logAction(null, "DELETE_PROJECT", {
      projectId: id
    })
  }

  async getPolicies() {
    return await Policy.findAll({
      where: { isActive: true },
      order: [["effectiveDate", "DESC"]],
    })
  }

  async createPolicy(data) {
    const policy = await Policy.create({
      title: data.title,
      description: data.description,
      effectiveDate: data.effectiveDate,
      isActive: true,
      createdAt: new Date(),
    })
    await auditService.logAction(data.userId, "CREATE_POLICY", {
      policyId: policy.id,
      title: data.title
    })
    return policy
  }

  async getPolicyById(id) {
    return await Policy.findByPk(id)
  }

  async updatePolicy(id, data) {
    const policy = await Policy.findByPk(id)
    if (!policy) return null
    policy.title = data.title
    policy.description = data.description
    policy.effectiveDate = data.effectiveDate
    await policy.save()
    await auditService.logAction(data.userId, "UPDATE_POLICY", {
      policyId: id,
      title: data.title
    })
    return policy
  }

  async deletePolicy(id) {
    const policy = await Policy.findByPk(id)
    if (!policy) return null
    policy.isActive = false
    await policy.save()
    await auditService.logAction(null, "DELETE_POLICY", {
      policyId: id
    })
  }

  async getStrategicGoals() {
    return await StrategicGoal.findAll({
      where: { isActive: true },
      order: [["targetDate", "DESC"]],
    })
  }

  async createStrategicGoal(data) {
    const strategicGoal = await StrategicGoal.create({
      goal: data.goal,
      description: data.description,
      targetDate: data.targetDate,
      isActive: true,
      createdAt: new Date(),
    })
    await auditService.logAction(data.userId, "CREATE_STRATEGIC_GOAL", {
      strategicGoalId: strategicGoal.id,
      goal: data.goal
    })
    return strategicGoal
  }

  async getStrategicGoalById(id) {
    return await StrategicGoal.findByPk(id)
  }

  async updateStrategicGoal(id, data) {
    const strategicGoal = await StrategicGoal.findByPk(id)
    if (!strategicGoal) return null
    strategicGoal.goal = data.goal
    strategicGoal.description = data.description
    strategicGoal.targetDate = data.targetDate
    await strategicGoal.save()
    await auditService.logAction(data.userId, "UPDATE_STRATEGIC_GOAL", {
      strategicGoalId: id,
      goal: data.goal
    })
    return strategicGoal
  }

  async deleteStrategicGoal(id) {
    const strategicGoal = await StrategicGoal.findByPk(id)
    if (!strategicGoal) return null
    strategicGoal.isActive = false
    await strategicGoal.save()
  }

  async getDevelopmentPermits() {
    return await DevelopmentPermit.findAll({
      where: { isActive: true },
      order: [["issueDate", "DESC"]],
    })
  }

  async createDevelopmentPermit(data) {
    const developmentPermit = await DevelopmentPermit.create({
      permitNumber: data.permitNumber,
      description: data.description,
      issueDate: data.issueDate,
      expiryDate: data.expiryDate,
      status: data.status,
      isActive: true,
      createdAt: new Date(),
    })
    await auditService.logAction(data.userId, "CREATE_DEVELOPMENT_PERMIT", {
      developmentPermitId: developmentPermit.id,
      permitNumber: data.permitNumber
    })
    return developmentPermit
  }

  async getDevelopmentPermitById(id) {
    return await DevelopmentPermit.findByPk(id)
  }

  async updateDevelopmentPermit(id, data) {
    const developmentPermit = await DevelopmentPermit.findByPk(id)
    if (!developmentPermit) return null
    developmentPermit.permitNumber = data.permitNumber
    developmentPermit.description = data.description
    developmentPermit.issueDate = data.issueDate
    developmentPermit.expiryDate = data.expiryDate
    developmentPermit.status = data.status
    await developmentPermit.save()
    await auditService.logAction(data.userId, "UPDATE_DEVELOPMENT_PERMIT", {
      developmentPermitId: id,
      permitNumber: data.permitNumber
    })
    return developmentPermit
  }

  async deleteDevelopmentPermit(id) {
    const developmentPermit = await DevelopmentPermit.findByPk(id)
    if (!developmentPermit) return null
    developmentPermit.isActive = false
    await developmentPermit.save()
    await auditService.logAction(null, "DELETE_DEVELOPMENT_PERMIT", {
      developmentPermitId: id
    })
  }

  async approveUrbanPlan(id, data) {
    const urbanPlan = await UrbanPlan.findByPk(id)
    if (!urbanPlan) return null
    urbanPlan.status = "approved"
    await urbanPlan.save()
    await auditService.logAction(data.userId, "APPROVE_URBAN_PLAN", { urbanPlanId: id })
    return urbanPlan
  }

  async archiveUrbanPlan(id, data) {
    const urbanPlan = await UrbanPlan.findByPk(id)
    if (!urbanPlan) return null
    urbanPlan.status = "archived"
    await urbanPlan.save()
    await auditService.logAction(data.userId, "ARCHIVE_URBAN_PLAN", { urbanPlanId: id })
    return urbanPlan
  }

  async addProjectMilestone(projectId, data) {
    const project = await Project.findByPk(projectId)
    if (!project) return null
    const milestones = project.milestones || []
    const milestone = { id: Date.now(), ...data, createdAt: new Date() }
    milestones.push(milestone)
    project.milestones = milestones
    await project.save()
    await auditService.logAction(data.userId, "ADD_PROJECT_MILESTONE", { projectId, milestone: data.name })
    return milestone
  }

  async updateProjectMilestone(projectId, milestoneId, data) {
    const project = await Project.findByPk(projectId)
    if (!project) return null
    const milestones = project.milestones || []
    const index = milestones.findIndex(m => m.id == milestoneId)
    if (index === -1) return null
    milestones[index] = { ...milestones[index], ...data }
    project.milestones = milestones
    await project.save()
    await auditService.logAction(data.userId, "UPDATE_PROJECT_MILESTONE", { projectId, milestoneId })
    return milestones[index]
  }

  async completeProject(id, data) {
    const project = await Project.findByPk(id)
    if (!project) return null
    project.status = "completed"
    await project.save()
    await auditService.logAction(data.userId, "COMPLETE_PROJECT", { projectId: id })
    return project
  }

  async cancelProject(id, data) {
    const project = await Project.findByPk(id)
    if (!project) return null
    project.status = "cancelled"
    await project.save()
    await auditService.logAction(data.userId, "CANCEL_PROJECT", { projectId: id })
    return project
  }

  async approvePolicy(id, data) {
    const policy = await Policy.findByPk(id)
    if (!policy) return null
    policy.status = "approved"
    await policy.save()
    await auditService.logAction(data.userId, "APPROVE_POLICY", { policyId: id })
    return policy
  }

  async repealPolicy(id, data) {
    const policy = await Policy.findByPk(id)
    if (!policy) return null
    policy.status = "repealed"
    policy.isActive = false
    await policy.save()
    await auditService.logAction(data.userId, "REPEAL_POLICY", { policyId: id })
    return policy
  }

  async updateGoalProgress(id, data) {
    const goal = await StrategicGoal.findByPk(id)
    if (!goal) return null
    goal.progress = data.progress
    await goal.save()
    await auditService.logAction(data.userId, "UPDATE_GOAL_PROGRESS", { goalId: id, progress: data.progress })
    return goal
  }

  async achieveStrategicGoal(id, data) {
    const goal = await StrategicGoal.findByPk(id)
    if (!goal) return null
    goal.status = "achieved"
    goal.progress = 100
    await goal.save()
    await auditService.logAction(data.userId, "ACHIEVE_STRATEGIC_GOAL", { goalId: id })
    return goal
  }

  async approveDevelopmentPermit(id, data) {
    const permit = await DevelopmentPermit.findByPk(id)
    if (!permit) return null
    permit.status = "approved"
    await permit.save()
    await auditService.logAction(data.userId, "APPROVE_DEVELOPMENT_PERMIT", { permitId: id })
    return permit
  }

  async rejectDevelopmentPermit(id, data) {
    const permit = await DevelopmentPermit.findByPk(id)
    if (!permit) return null
    permit.status = "rejected"
    await permit.save()
    await auditService.logAction(data.userId, "REJECT_DEVELOPMENT_PERMIT", { permitId: id })
    return permit
  }

  async issueDevelopmentPermit(id, data) {
    const permit = await DevelopmentPermit.findByPk(id)
    if (!permit) return null
    permit.status = "issued"
    await permit.save()
    await auditService.logAction(data.userId, "ISSUE_DEVELOPMENT_PERMIT", { permitId: id })
    return permit
  }

  async getPlanningReport() {
    const totalUrbanPlans = await UrbanPlan.count({ where: { isActive: true } })
    const totalProjects = await Project.count({ where: { isActive: true } })
    const totalPolicies = await Policy.count({ where: { isActive: true } })
    const totalGoals = await StrategicGoal.count({ where: { isActive: true } })
    const totalPermits = await DevelopmentPermit.count({ where: { isActive: true } })
    return { totalUrbanPlans, totalProjects, totalPolicies, totalGoals, totalPermits }
  }

  async getProjectProgressAnalytics() {
    const projects = await Project.findAll({ where: { isActive: true } })
    const statusCounts = projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1
      return acc
    }, {})
    return statusCounts
  }

  async getPermitProcessingAnalytics() {
    const permits = await DevelopmentPermit.findAll({ where: { isActive: true } })
    const statusCounts = permits.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1
      return acc
    }, {})
    return statusCounts
  }

  async getGoalAchievementMetrics() {
    const goals = await StrategicGoal.findAll({ where: { isActive: true } })
    const achieved = goals.filter(g => g.status === "achieved").length
    const inProgress = goals.filter(g => g.status !== "achieved").length
    return { total: goals.length, achieved, inProgress }
  }
}

module.exports = PlanningService
