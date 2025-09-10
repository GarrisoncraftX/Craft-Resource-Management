const LeaveController = require('../src/modules/leave/controller');
const LeaveService = require('../src/modules/leave/service');

describe('LeaveController', () => {
  let leaveController;
  let leaveService;
  let req;
  let res;
  let next;

  beforeEach(() => {
    leaveService = {
      getLeaveTypes: jest.fn(),
      createLeaveType: jest.fn(),
      createLeaveRequest: jest.fn(),
      getUserLeaveRequests: jest.fn(),
      updateLeaveRequestStatus: jest.fn(),
      getLeaveBalances: jest.fn(),
      approveLeaveRequest: jest.fn(),
      rejectLeaveRequest: jest.fn(),
    };
    leaveController = new LeaveController(leaveService);
    req = {
      body: {},
      params: {},
      query: {},
      userContext: { userId: 'user123' },
    };
    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLeaveTypes', () => {
    it('should get all leave types', async () => {
      const leaveTypes = [{ name: 'Annual' }, { name: 'Sick' }];
      leaveService.getLeaveTypes.mockResolvedValue(leaveTypes);

      await leaveController.getLeaveTypes(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: leaveTypes });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('Something went wrong');
      leaveService.getLeaveTypes.mockRejectedValue(error);

      await leaveController.getLeaveTypes(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createLeaveType', () => {
    it('should create a leave type', async () => {
      const leaveType = { name: 'Annual' };
      req.body = leaveType;
      leaveService.createLeaveType.mockResolvedValue(leaveType);

      await leaveController.createLeaveType(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: leaveType });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('Something went wrong');
      req.body = { name: 'Annual' };
      leaveService.createLeaveType.mockRejectedValue(error);

      await leaveController.createLeaveType(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createLeaveRequest', () => {
    it('should create a leave request', async () => {
      const leaveRequest = { type: 'Annual', startDate: '2024-01-01', endDate: '2024-01-05' };
      req.body = leaveRequest;
      leaveService.createLeaveRequest.mockResolvedValue(leaveRequest);

      await leaveController.createLeaveRequest(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: leaveRequest });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('Something went wrong');
      req.body = { type: 'Annual', startDate: '2024-01-01', endDate: '2024-01-05' };
      leaveService.createLeaveRequest.mockRejectedValue(error);

      await leaveController.createLeaveRequest(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserLeaveRequests', () => {
    it('should get user leave requests', async () => {
      const leaveRequests = [{ type: 'Annual' }];
      leaveService.getUserLeaveRequests.mockResolvedValue(leaveRequests);

      await leaveController.getUserLeaveRequests(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: leaveRequests });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('Something went wrong');
      leaveService.getUserLeaveRequests.mockRejectedValue(error);

      await leaveController.getUserLeaveRequests(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateLeaveRequestStatus', () => {
    it('should update leave request status', async () => {
      const updatedRequest = { status: 'Approved' };
      req.params.id = 'req123';
      req.body = { status: 'Approved', reviewedBy: 'admin', comments: 'OK' };
      leaveService.updateLeaveRequestStatus.mockResolvedValue(updatedRequest);

      await leaveController.updateLeaveRequestStatus(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: updatedRequest });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 404 if leave request not found', async () => {
        req.params.id = 'req123';
        req.body = { status: 'Approved', reviewedBy: 'admin', comments: 'OK' };
        leaveService.updateLeaveRequestStatus.mockResolvedValue(null);
  
        await leaveController.updateLeaveRequestStatus(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Leave request not found' });
        expect(next).not.toHaveBeenCalled();
      });

    it('should handle errors', async () => {
      const error = new Error('Something went wrong');
      req.params.id = 'req123';
      req.body = { status: 'Approved', reviewedBy: 'admin', comments: 'OK' };
      leaveService.updateLeaveRequestStatus.mockRejectedValue(error);

      await leaveController.updateLeaveRequestStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getLeaveBalances', () => {
    it('should get leave balances', async () => {
      const balances = { Annual: 10 };
      req.params.userId = 'user123';
      leaveService.getLeaveBalances.mockResolvedValue(balances);

      await leaveController.getLeaveBalances(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: balances });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('Something went wrong');
      req.params.userId = 'user123';
      leaveService.getLeaveBalances.mockRejectedValue(error);

      await leaveController.getLeaveBalances(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('approveLeaveRequest', () => {
    it('should approve a leave request', async () => {
      const result = { status: 'Approved' };
      req.params.id = 'req123';
      leaveService.approveLeaveRequest.mockResolvedValue(result);

      await leaveController.approveLeaveRequest(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: result });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
        const error = new Error('Something went wrong');
        req.params.id = 'req123';
        leaveService.approveLeaveRequest.mockRejectedValue(error);
  
        await leaveController.approveLeaveRequest(req, res, next);
  
        expect(next).toHaveBeenCalledWith(error);
      });
  });

  describe('rejectLeaveRequest', () => {
    it('should reject a leave request', async () => {
      const result = { status: 'Rejected' };
      req.params.id = 'req123';
      req.body.reason = 'Not enough cover';
      leaveService.rejectLeaveRequest.mockResolvedValue(result);

      await leaveController.rejectLeaveRequest(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: result });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
        const error = new Error('Something went wrong');
        req.params.id = 'req123';
        req.body.reason = 'Not enough cover';
        leaveService.rejectLeaveRequest.mockRejectedValue(error);
  
        await leaveController.rejectLeaveRequest(req, res, next);
  
        expect(next).toHaveBeenCalledWith(error);
      });
  });
});
