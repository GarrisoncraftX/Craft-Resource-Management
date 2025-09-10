const {
  UrbanPlan,
  Project,
  Policy,
  StrategicGoal,
  DevelopmentPermit,
} = require("./model")

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
    return urbanPlan
  }

  async deleteUrbanPlan(id) {
    const urbanPlan = await UrbanPlan.findByPk(id)
    if (!urbanPlan) return null
    urbanPlan.isActive = false
    await urbanPlan.save()
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
    return project
  }

  async deleteProject(id) {
    const project = await Project.findByPk(id)
    if (!project) return null
    project.isActive = false
    await project.save()
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
    return policy
  }

  async deletePolicy(id) {
    const policy = await Policy.findByPk(id)
    if (!policy) return null
    policy.isActive = false
    await policy.save()
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
    return developmentPermit
  }

  async deleteDevelopmentPermit(id) {
    const developmentPermit = await DevelopmentPermit.findByPk(id)
    if (!developmentPermit) return null
    developmentPermit.isActive = false
    await developmentPermit.save()
  }
}

module.exports = PlanningService
