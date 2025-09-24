const { Op } = require("sequelize")
const { sequelize } = require("../../config/sequelize")
const { LeaveType, LeaveRequest, LeaveBalance, LeaveApproval } = require("./model")

class LeaveService {
  async getLeaveTypes() {
    return await LeaveType.findAll({
      where: { isActive: true },
      order: [["name", "ASC"]],
    })
  }

  async createLeaveType(data) {
    const leaveType = await LeaveType.create({
      name: data.name,
      daysAllowed: data.daysAllowed,
      description: data.description,
      isActive: true,
      createdAt: new Date(),
    })
    return leaveType
  }

  async getLeaveTypeById(id) {
    return await LeaveType.findByPk(id)
  }

  async createLeaveRequest(data) {
    // Calculate totalDays as difference between endDate and startDate inclusive
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    const timeDiff = end.getTime() - start.getTime()
    const totalDays = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1

    const leaveRequest = await LeaveRequest.create({
      id: `LR_${Date.now()}`,
      userId: data.userId,
      leaveTypeId: data.leaveTypeId,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: totalDays,
      reason: data.reason,
      status: "pending",
      appliedAt: new Date(),
      createdAt: new Date(),
    })
    return leaveRequest
  }

  async getLeaveRequestById(id) {
    return await LeaveRequest.findByPk(id, {
      include: [{ model: LeaveType }],
    })
  }

  async getUserLeaveRequests(userId, filters = {}) {
    // Validate userId to prevent undefined parameter error
    if (!userId || userId === 'undefined') {
      throw new Error("User ID is required and cannot be undefined")
    }

    const where = { userId }
    if (filters.status) {
      where.status = filters.status
    }
    if (filters.startDate) {
      where.startDate = { [Op.gte]: filters.startDate }
    }
    if (filters.endDate) {
      where.endDate = { [Op.lte]: filters.endDate }
    }
    return await LeaveRequest.findAll({
      where,
      include: [{ model: LeaveType }],
      order: [["createdAt", "DESC"]],
      limit: filters.limit ? parseInt(filters.limit) : undefined,
    })
  }

  async getAllLeaveRequests(filters = {}) {
    // For HR to view all employees' leave requests
    const where = {}
    if (filters && filters.status) {
      where.status = filters.status
    }
    if (filters && filters.startDate) {
      where.startDate = { [Op.gte]: filters.startDate }
    }
    if (filters && filters.endDate) {
      where.endDate = { [Op.lte]: filters.endDate }
    }
    if (filters && filters.userId && filters.userId !== 'undefined') {
      where.userId = filters.userId
    }

    console.log('getAllLeaveRequests - filters:', filters);
    console.log('getAllLeaveRequests - where clause:', where);

    const result = await LeaveRequest.findAll({
      where,
      include: [{ model: LeaveType }],
      order: [["createdAt", "DESC"]],
      limit: filters && filters.limit ? parseInt(filters.limit) : undefined,
    });

    console.log('getAllLeaveRequests - result count:', result.length);
    console.log('getAllLeaveRequests - first result:', result[0]);

    return result;
  }

  async updateLeaveRequestStatus(id, status, reviewedBy, comments = null) {
    const leaveRequest = await LeaveRequest.findByPk(id)
    if (!leaveRequest) return null
    leaveRequest.status = status
    leaveRequest.reviewedBy = reviewedBy
    leaveRequest.reviewComments = comments
    leaveRequest.reviewedAt = new Date()
    leaveRequest.updatedAt = new Date()
    await leaveRequest.save()
    return leaveRequest
  }

  async getLeaveBalances(userId) {
    const balances = await LeaveBalance.findAll({
      where: { userId },
      include: [{ model: LeaveType }],
      attributes: [
        'leaveTypeId',
        [sequelize.col('LeaveType.name'), 'leaveTypeName'],
        'allocatedDays',
        'usedDays',
        'carriedForwardDays',
        'remainingDays',
        'updatedAt',
      ],
      raw: true,
      nest: true,
    });

    // Map to include calculated remaining balance and formatted strings
    return balances.map(balance => ({
      leaveTypeId: balance.leaveTypeId,
      leaveTypeName: balance.leaveTypeName,
      allocatedDays: balance.allocatedDays,
      allocatedDaysFormatted: `${balance.allocatedDays} days`,
      usedDays: balance.usedDays,
      usedDaysFormatted: `${balance.usedDays} days`,
      carriedForwardDays: balance.carriedForwardDays,
      carriedForwardDaysFormatted: `${balance.carriedForwardDays} days`,
      remainingDays: balance.remainingDays,
      remainingDaysFormatted: `${balance.remainingDays} days`,
      balance: balance.remainingDays,
      updatedAt: balance.updatedAt,
    }));
  }

  async approveLeaveRequest(leaveRequestId, approverId) {
    const leaveRequest = await LeaveRequest.findByPk(leaveRequestId)
    if (!leaveRequest) throw new Error("Leave request not found")
    if (leaveRequest.status !== "pending") throw new Error("Only pending leave requests can be approved")

    leaveRequest.status = "approved"
    leaveRequest.reviewedBy = approverId
    leaveRequest.reviewedAt = new Date()
    leaveRequest.updatedAt = new Date()
    await leaveRequest.save()

    const approvalId = `LA_${Date.now()}`
    await LeaveApproval.create({
      id: approvalId,
      leaveRequestId,
      approverId,
      approvalLevel: 1,
      status: "approved",
      createdAt: new Date(),
    })

    return leaveRequest
  }

  async rejectLeaveRequest(leaveRequestId, approverId, reason) {
    const leaveRequest = await LeaveRequest.findByPk(leaveRequestId)
    if (!leaveRequest) throw new Error("Leave request not found")
    if (leaveRequest.status !== "pending") throw new Error("Only pending leave requests can be rejected")

    leaveRequest.status = "rejected"
    leaveRequest.reviewComments = reason
    leaveRequest.reviewedBy = approverId
    leaveRequest.reviewedAt = new Date()
    leaveRequest.updatedAt = new Date()
    await leaveRequest.save()

    const approvalId = `LA_${Date.now()}`
    await LeaveApproval.create({
      id: approvalId,
      leaveRequestId,
      approverId,
      approvalLevel: 1,
      status: "rejected",
      comments: reason,
      createdAt: new Date(),
    })

    return leaveRequest
  }

  async getLeaveStatistics() {
    try {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

      // Count pending requests
      const pendingRequests = await LeaveRequest.count({
        where: { status: "pending" }
      })

      // Count approved requests today
      const approvedToday = await LeaveRequest.count({
        where: {
          status: "approved",
          reviewedAt: {
            [Op.gte]: startOfDay,
            [Op.lt]: endOfDay
          }
        }
      })

      // Count employees currently on leave (approved requests that overlap with today)
      const employeesOnLeave = await LeaveRequest.count({
        where: {
          status: "approved",
          startDate: { [Op.lte]: today },
          endDate: { [Op.gte]: today }
        },
        distinct: true,
        col: 'userId'
      })

      // Calculate average leave days for approved requests in the current month
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      const approvedRequestsThisMonth = await LeaveRequest.findAll({
        where: {
          status: "approved",
          startDate: {
            [Op.gte]: startOfMonth,
            [Op.lte]: endOfMonth
          }
        },
        attributes: ['totalDays']
      })

      const averageLeaveDays = approvedRequestsThisMonth.length > 0
        ? approvedRequestsThisMonth.reduce((sum, req) => sum + req.totalDays, 0) / approvedRequestsThisMonth.length
        : 0

      return {
        pendingRequests,
        approvedToday,
        employeesOnLeave,
        averageLeaveDays: Math.round(averageLeaveDays * 10) / 10 
      }
    } catch (error) {
      console.error("Error calculating leave statistics:", error)
      throw new Error("Failed to calculate leave statistics")
    }
  }
}

module.exports = LeaveService