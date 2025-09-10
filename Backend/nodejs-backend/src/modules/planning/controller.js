const PlanningService = require("./service")
const planningService = new PlanningService()

class PlanningController {
  async getUrbanPlans(req, res, next) {
    try {
      const urbanPlans = await planningService.getUrbanPlans()
      res.json({ success: true, data: urbanPlans })
    } catch (error) {
      next(error)
    }
  }

  async createUrbanPlan(req, res, next) {
    try {
      const urbanPlan = await planningService.createUrbanPlan(req.body)
      res.status(201).json({ success: true, data: urbanPlan })
    } catch (error) {
      next(error)
    }
  }

  async updateUrbanPlan(req, res, next) {
    try {
      const id = req.params.id
      const updatedUrbanPlan = await planningService.updateUrbanPlan(id, req.body)
      if (!updatedUrbanPlan) {
        return res.status(404).json({ success: false, message: "Urban plan not found" })
      }
      res.json({ success: true, data: updatedUrbanPlan })
    } catch (error) {
      next(error)
    }
  }

  async deleteUrbanPlan(req, res, next) {
    try {
      const id = req.params.id
      await planningService.deleteUrbanPlan(id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  async getProjects(req, res, next) {
    try {
      const projects = await planningService.getProjects()
      res.json({ success: true, data: projects })
    } catch (error) {
      next(error)
    }
  }

  async createProject(req, res, next) {
    try {
      const project = await planningService.createProject(req.body)
      res.status(201).json({ success: true, data: project })
    } catch (error) {
      next(error)
    }
  }

  async updateProject(req, res, next) {
    try {
      const id = req.params.id
      const updatedProject = await planningService.updateProject(id, req.body)
      if (!updatedProject) {
        return res.status(404).json({ success: false, message: "Project not found" })
      }
      res.json({ success: true, data: updatedProject })
    } catch (error) {
      next(error)
    }
  }

  async deleteProject(req, res, next) {
    try {
      const id = req.params.id
      await planningService.deleteProject(id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  async getPolicies(req, res, next) {
    try {
      const policies = await planningService.getPolicies()
      res.json({ success: true, data: policies })
    } catch (error) {
      next(error)
    }
  }

  async createPolicy(req, res, next) {
    try {
      const policy = await planningService.createPolicy(req.body)
      res.status(201).json({ success: true, data: policy })
    } catch (error) {
      next(error)
    }
  }

  async updatePolicy(req, res, next) {
    try {
      const id = req.params.id
      const updatedPolicy = await planningService.updatePolicy(id, req.body)
      if (!updatedPolicy) {
        return res.status(404).json({ success: false, message: "Policy not found" })
      }
      res.json({ success: true, data: updatedPolicy })
    } catch (error) {
      next(error)
    }
  }

  async deletePolicy(req, res, next) {
    try {
      const id = req.params.id
      await planningService.deletePolicy(id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  async getStrategicGoals(req, res, next) {
    try {
      const strategicGoals = await planningService.getStrategicGoals()
      res.json({ success: true, data: strategicGoals })
    } catch (error) {
      next(error)
    }
  }

  async createStrategicGoal(req, res, next) {
    try {
      const strategicGoal = await planningService.createStrategicGoal(req.body)
      res.status(201).json({ success: true, data: strategicGoal })
    } catch (error) {
      next(error)
    }
  }

  async updateStrategicGoal(req, res, next) {
    try {
      const id = req.params.id
      const updatedStrategicGoal = await planningService.updateStrategicGoal(id, req.body)
      if (!updatedStrategicGoal) {
        return res.status(404).json({ success: false, message: "Strategic goal not found" })
      }
      res.json({ success: true, data: updatedStrategicGoal })
    } catch (error) {
      next(error)
    }
  }

  async deleteStrategicGoal(req, res, next) {
    try {
      const id = req.params.id
      await planningService.deleteStrategicGoal(id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  async getDevelopmentPermits(req, res, next) {
    try {
      const developmentPermits = await planningService.getDevelopmentPermits()
      res.json({ success: true, data: developmentPermits })
    } catch (error) {
      next(error)
    }
  }

  async createDevelopmentPermit(req, res, next) {
    try {
      const developmentPermit = await planningService.createDevelopmentPermit(req.body)
      res.status(201).json({ success: true, data: developmentPermit })
    } catch (error) {
      next(error)
    }
  }

  async updateDevelopmentPermit(req, res, next) {
    try {
      const id = req.params.id
      const updatedDevelopmentPermit = await planningService.updateDevelopmentPermit(id, req.body)
      if (!updatedDevelopmentPermit) {
        return res.status(404).json({ success: false, message: "Development permit not found" })
      }
      res.json({ success: true, data: updatedDevelopmentPermit })
    } catch (error) {
      next(error)
    }
  }

  async deleteDevelopmentPermit(req, res, next) {
    try {
      const id = req.params.id
      await planningService.deleteDevelopmentPermit(id)
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new PlanningController()
