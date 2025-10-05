class LeaveController {
  constructor(leaveService) {
    this.leaveService = leaveService;
  }

  async getLeaveTypes(req, res, next) {
    try {
      const leaveTypes = await this.leaveService.getLeaveTypes();
      res.json({ success: true, data: leaveTypes });
    } catch (error) {
      next(error);
    }
  }

  async createLeaveType(req, res, next) {
    try {
      const leaveType = await this.leaveService.createLeaveType(req.body);
      res.status(201).json({ success: true, data: leaveType });
    } catch (error) {
      next(error);
    }
  }

  async createLeaveRequest(req, res, next) {
    try {
      const leaveRequest = await this.leaveService.createLeaveRequest(req.body);
      res.status(201).json({ success: true, data: leaveRequest });
    } catch (error) {
      next(error);
    }
  }

  async getUserLeaveRequests(req, res, next) {
    try {
      const userId = req.params.userId || req.userContext?.userId;
      // Validate userId to prevent undefined parameter error
      if (!userId || userId === 'undefined') {
        return res.status(400).json({ success: false, message: "User ID is required and cannot be undefined" });
      }
      const filters = req.query;
      const leaveRequests = await this.leaveService.getUserLeaveRequests(userId, filters);
      res.json({ success: true, data: leaveRequests });
    } catch (error) {
      next(error);
    }
  }

  async getAllLeaveRequests(req, res, next) {
    try {
      const filters = req.query;
      const leaveRequests = await this.leaveService.getAllLeaveRequests(filters);
      res.json({ success: true, data: leaveRequests });
    } catch (error) {
      next(error);
    }
  }

  async updateLeaveRequestStatus(req, res, next) {
    try {
      const id = req.params.id;
      const { status, reviewedBy, comments } = req.body;
      const updatedRequest = await this.leaveService.updateLeaveRequestStatus(id, status, reviewedBy, comments);
      if (!updatedRequest) {
        return res.status(404).json({ success: false, message: "Leave request not found" });
      }
      res.json({ success: true, data: updatedRequest });
    } catch (error) {
      next(error);
    }
  }

  async getLeaveBalances(req, res, next) {
    try {
      const userId = req.params.userId;
      const balances = await this.leaveService.getLeaveBalances(userId);
      res.json({ success: true, data: balances });
    } catch (error) {
      next(error);
    }
  }

  async getAllLeaveBalances(req, res, next) {
    try {
      const balances = await this.leaveService.getAllLeaveBalances();
      res.json({ success: true, data: balances });
    } catch (error) {
      next(error);
    }
  }

  async approveLeaveRequest(req, res, next) {
    try {
      const id = req.params.id;
      const userId = req.body.userId || req.userContext?.userId;
      const result = await this.leaveService.approveLeaveRequest(id, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async rejectLeaveRequest(req, res, next) {
    try {
      const id = req.params.id;
      const userId = req.body.userId || req.userContext?.userId;
      const reason = req.body.reason;
      const result = await this.leaveService.rejectLeaveRequest(id, userId, reason);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getLeaveStatistics(req, res, next) {
    try {
      const statistics = await this.leaveService.getLeaveStatistics();
      res.json({ success: true, data: statistics });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LeaveController
