const LeaveService = require('../src/modules/leave/service');
const { LeaveType, LeaveRequest, LeaveBalance, LeaveApproval } = require('../src/modules/leave/model');

jest.mock('../src/modules/leave/model', () => ({
  LeaveType: {
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  },
  LeaveRequest: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
  },
  LeaveBalance: {
    findAll: jest.fn(),
  },
  LeaveApproval: {
    create: jest.fn(),
  },
}));

describe('LeaveService', () => {
  let leaveService;

  beforeEach(() => {
    leaveService = new LeaveService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLeaveTypes', () => {
    it('should get all active leave types', async () => {
      const leaveTypes = [{ name: 'Annual' }];
      LeaveType.findAll.mockResolvedValue(leaveTypes);

      const result = await leaveService.getLeaveTypes();

      expect(LeaveType.findAll).toHaveBeenCalledWith({
        where: { isActive: true },
        order: [['name', 'ASC']],
      });
      expect(result).toEqual(leaveTypes);
    });
  });

  describe('createLeaveType', () => {
    it('should create a leave type', async () => {
      const data = { name: 'Annual', daysAllowed: 20, description: 'Annual leave' };
      const leaveType = { ...data, isActive: true };
      LeaveType.create.mockResolvedValue(leaveType);

      const result = await leaveService.createLeaveType(data);

      expect(LeaveType.create).toHaveBeenCalledWith(expect.objectContaining(data));
      expect(result).toEqual(leaveType);
    });
  });

  describe('getLeaveTypeById', () => {
    it('should get a leave type by id', async () => {
      const leaveType = { id: 1, name: 'Annual' };
      LeaveType.findByPk.mockResolvedValue(leaveType);

      const result = await leaveService.getLeaveTypeById(1);

      expect(LeaveType.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(leaveType);
    });
  });

  describe('createLeaveRequest', () => {
    it('should create a leave request', async () => {
      const data = { userId: 'user123', leaveTypeId: 1, startDate: '2024-01-01', endDate: '2024-01-05', daysRequested: 5, reason: 'Vacation' };
      const leaveRequest = { ...data, status: 'pending' };
      LeaveRequest.create.mockResolvedValue(leaveRequest);

      const result = await leaveService.createLeaveRequest(data);

      expect(LeaveRequest.create).toHaveBeenCalledWith(expect.objectContaining(data));
      expect(result).toEqual(leaveRequest);
    });
  });

  describe('getLeaveRequestById', () => {
    it('should get a leave request by id', async () => {
      const leaveRequest = { id: 'LR_123', reason: 'Vacation' };
      LeaveRequest.findByPk.mockResolvedValue(leaveRequest);

      const result = await leaveService.getLeaveRequestById('LR_123');

      expect(LeaveRequest.findByPk).toHaveBeenCalledWith('LR_123', { include: [{ model: LeaveType }] });
      expect(result).toEqual(leaveRequest);
    });
  });

  describe('getUserLeaveRequests', () => {
    it('should get user leave requests with filters', async () => {
      const leaveRequests = [{ reason: 'Vacation' }];
      const filters = { status: 'pending', limit: '10' };
      LeaveRequest.findAll.mockResolvedValue(leaveRequests);

      const result = await leaveService.getUserLeaveRequests('user123', filters);

      expect(LeaveRequest.findAll).toHaveBeenCalledWith({
        where: { userId: 'user123', status: 'pending' },
        include: [{ model: LeaveType }],
        order: [['createdAt', 'DESC']],
        limit: 10,
      });
      expect(result).toEqual(leaveRequests);
    });
  });

  describe('updateLeaveRequestStatus', () => {
    it('should update leave request status', async () => {
        const leaveRequestInstance = {
            status: 'pending',
            reviewedBy: null,
            reviewComments: null,
            reviewedAt: null,
            updatedAt: null,
            save: jest.fn().mockResolvedValue(true),
          };
      LeaveRequest.findByPk.mockResolvedValue(leaveRequestInstance);

      const result = await leaveService.updateLeaveRequestStatus('LR_123', 'approved', 'admin123', 'Approved');

      expect(LeaveRequest.findByPk).toHaveBeenCalledWith('LR_123');
      expect(leaveRequestInstance.status).toBe('approved');
      expect(leaveRequestInstance.save).toHaveBeenCalled();
      expect(result).toEqual(leaveRequestInstance);
    });

    it('should return null if leave request not found', async () => {
        LeaveRequest.findByPk.mockResolvedValue(null);
    
        const result = await leaveService.updateLeaveRequestStatus('LR_123', 'approved', 'admin123', 'Approved');
    
        expect(result).toBeNull();
      });
  });

  describe('getLeaveBalances', () => {
    it('should get leave balances for a user', async () => {
      const balances = [{ type: 'Annual', balance: 10 }];
      LeaveBalance.findAll.mockResolvedValue(balances);

      const result = await leaveService.getLeaveBalances('user123');

      expect(LeaveBalance.findAll).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        include: [{ model: LeaveType }],
      });
      expect(result).toEqual(balances);
    });
  });

  describe('approveLeaveRequest', () => {
    it('should approve a leave request', async () => {
        const leaveRequestInstance = {
            status: 'pending',
            reviewedBy: null,
            reviewedAt: null,
            updatedAt: null,
            save: jest.fn().mockResolvedValue(true),
          };
      LeaveRequest.findByPk.mockResolvedValue(leaveRequestInstance);

      const result = await leaveService.approveLeaveRequest('LR_123', 'admin123');

      expect(leaveRequestInstance.status).toBe('approved');
      expect(leaveRequestInstance.save).toHaveBeenCalled();
      expect(LeaveApproval.create).toHaveBeenCalled();
      expect(result).toEqual(leaveRequestInstance);
    });

    it('should throw an error if leave request not found', async () => {
        LeaveRequest.findByPk.mockResolvedValue(null);
        await expect(leaveService.approveLeaveRequest('LR_123', 'admin123')).rejects.toThrow('Leave request not found');
      });
  });

  describe('rejectLeaveRequest', () => {
    it('should reject a leave request', async () => {
        const leaveRequestInstance = {
            status: 'pending',
            reviewComments: null,
            reviewedBy: null,
            reviewedAt: null,
            updatedAt: null,
            save: jest.fn().mockResolvedValue(true),
          };
      LeaveRequest.findByPk.mockResolvedValue(leaveRequestInstance);

      const result = await leaveService.rejectLeaveRequest('LR_123', 'admin123', 'Reason');

      expect(leaveRequestInstance.status).toBe('rejected');
      expect(leaveRequestInstance.save).toHaveBeenCalled();
      expect(LeaveApproval.create).toHaveBeenCalled();
      expect(result).toEqual(leaveRequestInstance);
    });

    it('should throw an error if leave request not found', async () => {
        LeaveRequest.findByPk.mockResolvedValue(null);
        await expect(leaveService.rejectLeaveRequest('LR_123', 'admin123', 'Reason')).rejects.toThrow('Leave request not found');
      });
  });
});
