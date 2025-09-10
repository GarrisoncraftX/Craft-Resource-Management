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
}

module.exports = LeaveService