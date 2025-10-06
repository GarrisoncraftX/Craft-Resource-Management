const { Op } = require("sequelize")
const { sequelize } = require("../../config/sequelize")
const { LeaveType, LeaveRequest, LeaveBalance, LeaveApproval } = require("./model")
const cloudinaryService = require('../../utils/cloudinary')
const User = require("../auth/model")

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

  async createLeaveRequest(data, files = []) {
    // Calculate totalDays as difference between endDate and startDate inclusive
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    const timeDiff = end.getTime() - start.getTime()
    const totalDays = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1

    let supportingDocumentsUrls = [];
    if (files.length > 0) {
      supportingDocumentsUrls = await cloudinaryService.uploadMultipleFiles(files);
    }

    const leaveRequest = await LeaveRequest.create({
      id: `LR_${Date.now()}`,
      userId: data.userId,
      leaveTypeId: data.leaveTypeId,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: totalDays,
      reason: data.reason,
      supportingDocuments: supportingDocumentsUrls.length > 0 ? supportingDocumentsUrls : null,
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


    const result = await LeaveRequest.findAll({
      where,
      include: [
        { model: LeaveType },
        { model: User, attributes: ['firstName', 'lastName', 'employeeId'] }
      ],
      order: [["createdAt", "DESC"]],
      limit: filters && filters.limit ? parseInt(filters.limit) : undefined,
    });

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
    const currentYear = new Date().getFullYear();

    const balances = await LeaveBalance.findAll({
      where: { userId, year: currentYear },
      include: [{ model: LeaveType }],
      attributes: [
        'leaveTypeId',
        [sequelize.col('LeaveType.name'), 'leaveTypeName'],
        'allocatedDays',
        'usedDays',
        'carriedForwardDays',
        'updatedAt',
      ],
      raw: true,
      nest: true,
    });

    // Map to include calculated remaining balance and formatted strings
    return balances.map(balance => {
      const remainingDays = balance.allocatedDays - balance.usedDays + balance.carriedForwardDays;
      return {
        leaveTypeId: balance.leaveTypeId,
        leaveTypeName: balance.leaveTypeName,
        allocatedDays: balance.allocatedDays,
        allocatedDaysFormatted: `${balance.allocatedDays} days`,
        usedDays: balance.usedDays,
        usedDaysFormatted: `${balance.usedDays} days`,
        carriedForwardDays: balance.carriedForwardDays,
        carriedForwardDaysFormatted: `${balance.carriedForwardDays} days`,
        remainingDays: remainingDays,
        remainingDaysFormatted: `${remainingDays} days`,
        balance: remainingDays,
        updatedAt: balance.updatedAt,
      };
    });
  }

  async getAllLeaveBalances() {
    const currentYear = new Date().getFullYear();

    const balances = await LeaveBalance.findAll({
      where: { year: currentYear },
      include: [
        { model: LeaveType },
        { model: User, attributes: ['id', 'firstName', 'lastName','middleName', 'employeeId'] }
      ],
      attributes: [
        'leaveTypeId',
        [sequelize.col('LeaveType.name'), 'leaveTypeName'],
        'allocatedDays',
        'usedDays',
        'carriedForwardDays',
        'updatedAt',
        [sequelize.col('User.id'), 'userId'],
        [sequelize.col('User.first_name'), 'firstName'],
        [sequelize.col('User.last_name'), 'lastName'],
        [sequelize.col('User.middle_name'), 'middleName'],
        [sequelize.col('User.employee_id'), 'employeeId'],
      ],
      raw: true,
      nest: true,
    });

    // Map to include calculated remaining balance, formatted strings, and employee info
    return balances.map(balance => {
      const remainingDays = balance.allocatedDays - balance.usedDays + balance.carriedForwardDays;
      return {
        leaveTypeId: balance.leaveTypeId,
        leaveTypeName: balance.leaveTypeName,
        allocatedDays: balance.allocatedDays,
        allocatedDaysFormatted: `${balance.allocatedDays} days`,
        usedDays: balance.usedDays,
        usedDaysFormatted: `${balance.usedDays} days`,
        carriedForwardDays: balance.carriedForwardDays,
        carriedForwardDaysFormatted: `${balance.carriedForwardDays} days`,
        remainingDays: remainingDays,
        remainingDaysFormatted: `${remainingDays} days`,
        balance: remainingDays,
        updatedAt: balance.updatedAt,
        userId: balance.userId,
        employeeName: `${balance.firstName} ${balance.lastName}`,
        firstName: balance.firstName,
        lastName: balance.lastName,
      };
    });
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
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear() + 1, 0, 1);

    // --- Concurrent Queries for Performance ---
    const [
      pendingRequests,
      approvedTodayCount,
      approvedRequestsForYear,
      totalApprovedLeavesCount
    ] = await Promise.all([
      // Count all pending requests
      LeaveRequest.count({
        where: { status: "pending" }
      }),

      // Count approved requests that are active today
      LeaveRequest.count({
        where: {
          status: "approved",
          [Op.or]: [
            { startDate: { [Op.lte]: startOfDay }, endDate: { [Op.gte]: startOfDay } },
            { startDate: { [Op.between]: [startOfDay, endOfDay] } },
            { endDate: { [Op.between]: [startOfDay, endOfDay] } }
          ]
        }
      }),

      // Fetch all approved requests for the current year in one go
      LeaveRequest.findAll({
        where: {
          status: "approved",
          startDate: {
            [Op.gte]: startOfYear,
            [Op.lt]: endOfYear
          }
        },
        attributes: ['totalDays', 'startDate']
      }),

      // Count total unique users with approved leaves (all time)
      LeaveRequest.count({
        where: { status: "approved" },
        distinct: true,
        col: 'userId'
      })
    ]);

    // --- In-memory Calculations from Fetched Data ---
    let totalDaysThisMonth = 0;
    let approvedRequestsThisMonthCount = 0;
    let totalDaysThisYear = 0;
    const employeesOnLeaveSet = new Set();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    approvedRequestsForYear.forEach(request => {
      const requestStartDate = new Date(request.startDate);

      // Check if the leave falls within the current month
      if (requestStartDate >= startOfMonth && requestStartDate <= endOfMonth) {
        totalDaysThisMonth += request.totalDays;
        approvedRequestsThisMonthCount++;
      }

      // Add to total days for the year
      totalDaysThisYear += request.totalDays;
      
      // Check if the leave is currently active today (this is a separate calculation from approvedTodayCount)
      if (request.startDate <= today && request.endDate >= today) {
        employeesOnLeaveSet.add(request.userId);
      }
    });

    const averageLeaveDaysThisMonth = approvedRequestsThisMonthCount > 0
      ? totalDaysThisMonth / approvedRequestsThisMonthCount
      : 0;

    const averageLeaveDaysThisYear = approvedRequestsForYear.length > 0
      ? totalDaysThisYear / approvedRequestsForYear.length
      : 0;

    return {
      pendingRequests,
      approvedToday: approvedTodayCount,
      employeesOnLeave: employeesOnLeaveSet.size,
      averageLeaveDaysThisMonth: Math.round(averageLeaveDaysThisMonth * 10) / 10,
      averageLeaveDaysThisYear: Math.round(averageLeaveDaysThisYear * 10) / 10,
      totalApprovedLeaves: totalApprovedLeavesCount
    };

  } catch (error) {
    console.error("Error calculating leave statistics:", error);
    throw new Error("Failed to calculate leave statistics");
  }
}

  // Initialize leave balances for a new user
  async initializeLeaveBalancesForUser(userId) {
    const currentYear = new Date().getFullYear();
    const leaveTypes = await this.getLeaveTypes();

    const balances = leaveTypes.map(leaveType => ({
      userId,
      leaveTypeId: leaveType.id,
      year: currentYear,
      allocatedDays: leaveType.maxDaysPerYear,
      usedDays: 0,
      carriedForwardDays: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await LeaveBalance.bulkCreate(balances);
    return balances;
  }

  // Scheduled job to reset leave balances annually on January 1st
  async resetAnnualLeaveBalances() {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    // Get all users
    const users = await User.findAll({ attributes: ['id'] });

    for (const user of users) {
      const leaveTypes = await this.getLeaveTypes();

      for (const leaveType of leaveTypes) {
        // Get previous year's balance
        const previousBalance = await LeaveBalance.findOne({
          where: { userId: user.id, leaveTypeId: leaveType.id, year: previousYear }
        });

        let carriedForward = 0;
        if (previousBalance && leaveType.carryForwardAllowed) {
          const remaining = previousBalance.allocatedDays - previousBalance.usedDays + previousBalance.carriedForwardDays;
          carriedForward = Math.min(remaining, leaveType.maxCarryForwardDays);
        }

        // Create new balance for current year
        await LeaveBalance.create({
          userId: user.id,
          leaveTypeId: leaveType.id,
          year: currentYear,
          allocatedDays: leaveType.maxDaysPerYear,
          usedDays: 0,
          carriedForwardDays: carriedForward,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }

  // Update leave entitlement on milestone
  async updateLeaveEntitlementOnMilestone(userId, milestone) {
    const currentYear = new Date().getFullYear();
    let additionalDays = 0;

    // Define milestone increases (customize as needed)
    switch (milestone) {
      case '1_year':
        additionalDays = 1; // Add 1 day for annual leave
        break;
      case '5_years':
        additionalDays = 2;
        break;
      case '10_years':
        additionalDays = 3;
        break;
      default:
        return; // No change for unknown milestones
    }

    // Assuming annual leave type has id 1 (adjust based on actual data)
    const annualLeaveTypeId = 1;

    const balance = await LeaveBalance.findOne({
      where: { userId, leaveTypeId: annualLeaveTypeId, year: currentYear }
    });

    if (balance) {
      balance.allocatedDays += additionalDays;
      balance.updatedAt = new Date();
      await balance.save();
    }
  }
}

module.exports = LeaveService
