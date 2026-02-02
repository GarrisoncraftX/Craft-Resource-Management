const LeaveService = require('../../src/modules/leave/service');
const { LeaveType, LeaveRequest, LeaveBalance } = require('../../src/modules/leave/model');

jest.mock('../../src/modules/leave/model');

describe('Leave Service - Unit Tests', () => {
  let leaveService;

  beforeEach(() => {
    leaveService = new LeaveService();
    jest.clearAllMocks();
  });

  describe('getLeaveTypes', () => {
    it('should return all active leave types', async () => {
      const mockLeaveTypes = [
        { id: 1, name: 'Annual Leave', daysAllowed: 21, isActive: true },
        { id: 2, name: 'Sick Leave', daysAllowed: 10, isActive: true }
      ];

      LeaveType.findAll.mockResolvedValue(mockLeaveTypes);

      const result = await leaveService.getLeaveTypes();

      expect(result).toEqual(mockLeaveTypes);
      expect(LeaveType.findAll).toHaveBeenCalledWith({
        where: { isActive: true },
        order: [['name', 'ASC']]
      });
    });
  });

  describe('createLeaveType', () => {
    it('should create a new leave type successfully', async () => {
      const leaveTypeData = {
        name: 'Maternity Leave',
        daysAllowed: 90,
        description: 'Leave for maternity',
        actorId: 1
      };

      const mockCreatedLeaveType = { id: 3, ...leaveTypeData };
      LeaveType.create.mockResolvedValue(mockCreatedLeaveType);

      const result = await leaveService.createLeaveType(leaveTypeData);

      expect(result).toEqual(mockCreatedLeaveType);
      expect(LeaveType.create).toHaveBeenCalled();
    });
  });

  describe('createLeaveRequest', () => {
    it('should create leave request with correct total days calculation', async () => {
      const requestData = {
        userId: 1,
        leaveTypeId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        reason: 'Vacation'
      };

      const mockLeaveRequest = { id: 'LR_123', ...requestData, totalDays: 5 };
      LeaveRequest.create.mockResolvedValue(mockLeaveRequest);

      const result = await leaveService.createLeaveRequest(requestData);

      expect(result.totalDays).toBe(5);
      expect(LeaveRequest.create).toHaveBeenCalled();
    });
  });

  describe('approveLeaveRequest', () => {
    it('should approve leave request and update balance', async () => {
      const mockLeaveRequest = {
        id: 'LR_123',
        userId: 1,
        leaveTypeId: 1,
        totalDays: 5,
        status: 'pending',
        save: jest.fn()
      };

      const mockLeaveBalance = {
        userId: 1,
        leaveTypeId: 1,
        allocatedDays: 21,
        usedDays: 0,
        carriedForwardDays: 0,
        save: jest.fn()
      };

      LeaveRequest.findByPk.mockResolvedValue(mockLeaveRequest);
      LeaveRequest.findOne.mockResolvedValue(null);
      LeaveBalance.findOne.mockResolvedValue(mockLeaveBalance);

      const result = await leaveService.approveLeaveRequest('LR_123', 1);

      expect(result.status).toBe('approved');
      expect(mockLeaveBalance.usedDays).toBe(5);
    });

    it('should throw error if leave request not found', async () => {
      LeaveRequest.findByPk.mockResolvedValue(null);

      await expect(leaveService.approveLeaveRequest('INVALID', 1))
        .rejects.toThrow('Leave request not found');
    });

    it('should throw error if leave request is not pending', async () => {
      const mockLeaveRequest = {
        id: 'LR_123',
        status: 'approved'
      };

      LeaveRequest.findByPk.mockResolvedValue(mockLeaveRequest);

      await expect(leaveService.approveLeaveRequest('LR_123', 1))
        .rejects.toThrow('Leave request is not in pending status');
    });
  });

  describe('getLeaveBalances', () => {
    it('should return leave balances with calculated remaining days', async () => {
      const mockBalances = [
        {
          leaveTypeId: 1,
          leaveTypeName: 'Annual Leave',
          allocatedDays: 21,
          usedDays: 5,
          carriedForwardDays: 2,
          updatedAt: new Date()
        }
      ];

      LeaveBalance.findAll.mockResolvedValue(mockBalances);

      const result = await leaveService.getLeaveBalances(1);

      expect(result[0].remainingDays).toBe(18);
      expect(result[0].remainingDaysFormatted).toBe('18 days');
    });
  });

  describe('rejectLeaveRequest', () => {
    it('should reject leave request with reason', async () => {
      const mockLeaveRequest = {
        id: 'LR_123',
        userId: 1,
        status: 'pending',
        save: jest.fn()
      };

      LeaveRequest.findByPk.mockResolvedValue(mockLeaveRequest);

      const result = await leaveService.rejectLeaveRequest('LR_123', 1, 'Insufficient balance');

      expect(result.status).toBe('rejected');
      expect(result.reviewComments).toBe('Insufficient balance');
    });
  });

  describe('initializeLeaveBalancesForUser', () => {
    it('should initialize leave balances for new user', async () => {
      const mockLeaveTypes = [
        { id: 1, name: 'Annual Leave', maxDaysPerYear: 21 },
        { id: 2, name: 'Sick Leave', maxDaysPerYear: 10 }
      ];

      LeaveType.findAll.mockResolvedValue(mockLeaveTypes);
      LeaveBalance.bulkCreate.mockResolvedValue([]);

      await leaveService.initializeLeaveBalancesForUser(1);

      expect(LeaveBalance.bulkCreate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ userId: 1, leaveTypeId: 1, allocatedDays: 21 }),
          expect.objectContaining({ userId: 1, leaveTypeId: 2, allocatedDays: 10 })
        ])
      );
    });
  });
});
