const ProcurementController = require('../src/modules/procurement/controller');

describe('ProcurementController', () => {
  let procurementController;
  let procurementService;
  let req;
  let res;
  let next;

  beforeEach(() => {
    procurementService = {
      createProcurementRequest: jest.fn(),
      getProcurementRequestById: jest.fn(),
      getProcurementRequests: jest.fn(),
      updateRequestStatus: jest.fn(),
      addRequestApproval: jest.fn(),
      submitProcurementRequest: jest.fn(),
      approveProcurementRequest: jest.fn(),
      rejectProcurementRequest: jest.fn(),
      createVendor: jest.fn(),
      getVendorById: jest.fn(),
      getVendors: jest.fn(),
      approveVendor: jest.fn(),
      blacklistVendor: jest.fn(),
      createTender: jest.fn(),
      getTenderById: jest.fn(),
      getTenders: jest.fn(),
      publishTender: jest.fn(),
      closeTender: jest.fn(),
      createBid: jest.fn(),
      getBidById: jest.fn(),
      getBids: jest.fn(),
      evaluateBid: jest.fn(),
      getEvaluationCommittee: jest.fn(),
      createOrUpdateEvaluationCommittee: jest.fn(),
      createContract: jest.fn(),
      getContractById: jest.fn(),
      getContracts: jest.fn(),
      updateContract: jest.fn(),
      amendContract: jest.fn(),
      getAuditTrails: jest.fn(),
      getProcurementActivityReport: jest.fn(),
    };
    procurementController = new ProcurementController(procurementService);
    req = {
      body: {},
      params: {},
      query: {},
      userContext: {
        userId: 'test-user-id',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addRequestApproval', () => {
    it('should add a request approval and return it', async () => {
      const approval = {
        id: '123',
        approverId: 'test-approver',
      };
      procurementService.addRequestApproval.mockResolvedValue(approval);
      req.params.id = '456';
      req.body = {
        approverId: 'test-approver',
        approvalLevel: 1,
        status: 'Approved',
        comments: 'Looks good',
      };

      await procurementController.addRequestApproval(req, res, next);

      expect(procurementService.addRequestApproval).toHaveBeenCalledWith(
        '456',
        'test-approver',
        1,
        'Approved',
        'Looks good'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: approval,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.addRequestApproval.mockRejectedValue(error);

      await procurementController.addRequestApproval(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('approveProcurementRequest', () => {
    it('should approve a procurement request and return the result', async () => {
      const result = {
        success: true
      };
      procurementService.approveProcurementRequest.mockResolvedValue(result);
      req.params.id = '123';

      await procurementController.approveProcurementRequest(req, res, next);

      expect(procurementService.approveProcurementRequest).toHaveBeenCalledWith('123', 'test-user-id');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.approveProcurementRequest.mockRejectedValue(error);

      await procurementController.approveProcurementRequest(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('rejectProcurementRequest', () => {
    it('should reject a procurement request and return the result', async () => {
      const result = {
        success: true
      };
      procurementService.rejectProcurementRequest.mockResolvedValue(result);
      req.params.id = '123';
      req.body.reason = 'Test Reason';

      await procurementController.rejectProcurementRequest(req, res, next);

      expect(procurementService.rejectProcurementRequest).toHaveBeenCalledWith('123', 'test-user-id', 'Test Reason');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.rejectProcurementRequest.mockRejectedValue(error);

      await procurementController.rejectProcurementRequest(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('submitProcurementRequest', () => {
    it('should submit a procurement request and return the result', async () => {
      const result = {
        success: true
      };
      procurementService.submitProcurementRequest.mockResolvedValue(result);
      req.params.id = '123';

      await procurementController.submitProcurementRequest(req, res, next);

      expect(procurementService.submitProcurementRequest).toHaveBeenCalledWith('123', 'test-user-id');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.submitProcurementRequest.mockRejectedValue(error);

      await procurementController.submitProcurementRequest(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createProcurementRequest', () => {
    it('should create a procurement request and return it with a 201 status code', async () => {
      const newRequest = {
        id: '123',
        item: 'Test Item',
        quantity: 10,
      };
      procurementService.createProcurementRequest.mockResolvedValue(newRequest);
      req.body = newRequest;

      await procurementController.createProcurementRequest(req, res, next);

      expect(procurementService.createProcurementRequest).toHaveBeenCalledWith(newRequest);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: newRequest,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.createProcurementRequest.mockRejectedValue(error);

      await procurementController.createProcurementRequest(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getProcurementRequestById', () => {
    it('should return a procurement request if found', async () => {
      const request = {
        id: '123',
        item: 'Test Item',
      };
      procurementService.getProcurementRequestById.mockResolvedValue(request);
      req.params.id = '123';

      await procurementController.getProcurementRequestById(req, res, next);

      expect(procurementService.getProcurementRequestById).toHaveBeenCalledWith('123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: request,
      });
    });

    it('should return a 404 error if the procurement request is not found', async () => {
      procurementService.getProcurementRequestById.mockResolvedValue(null);
      req.params.id = '123';

      await procurementController.getProcurementRequestById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Procurement request not found',
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.getProcurementRequestById.mockRejectedValue(error);

      await procurementController.getProcurementRequestById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getProcurementRequests', () => {
    it('should return a list of procurement requests', async () => {
      const requests = [
        {
          id: '123',
          item: 'Test Item 1'
        },
        {
          id: '456',
          item: 'Test Item 2'
        },
      ];
      procurementService.getProcurementRequests.mockResolvedValue(requests);

      await procurementController.getProcurementRequests(req, res, next);

      expect(procurementService.getProcurementRequests).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: requests,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.getProcurementRequests.mockRejectedValue(error);

      await procurementController.getProcurementRequests(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateRequestStatus', () => {
    it('should update a procurement request and return it', async () => {
      const updatedRequest = {
        id: '123',
        status: 'Approved'
      };
      procurementService.updateRequestStatus.mockResolvedValue(updatedRequest);
      req.params.id = '123';
      req.body = {
        status: 'Approved',
        updatedBy: 'test-user',
        comments: 'Approved',
      };

      await procurementController.updateRequestStatus(req, res, next);

      expect(procurementService.updateRequestStatus).toHaveBeenCalledWith(
        '123',
        'Approved',
        'test-user',
        'Approved'
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedRequest,
      });
    });

    it('should return a 404 error if the procurement request is not found', async () => {
      procurementService.updateRequestStatus.mockResolvedValue(null);
      req.params.id = '123';

      await procurementController.updateRequestStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Procurement request not found',
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.updateRequestStatus.mockRejectedValue(error);

      await procurementController.updateRequestStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createVendor', () => {
    it('should create a vendor and return it', async () => {
      const vendor = {
        id: '123',
        name: 'Test Vendor'
      };
      procurementService.createVendor.mockResolvedValue(vendor);
      req.body = vendor;

      await procurementController.createVendor(req, res, next);

      expect(procurementService.createVendor).toHaveBeenCalledWith(vendor);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: vendor,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.createVendor.mockRejectedValue(error);

      await procurementController.createVendor(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getVendors', () => {
    it('should return a list of vendors', async () => {
      const vendors = [
        {
          id: '123',
          name: 'Test Vendor 1'
        },
        {
          id: '456',
          name: 'Test Vendor 2'
        },
      ];
      procurementService.getVendors.mockResolvedValue(vendors);

      await procurementController.getVendors(req, res, next);

      expect(procurementService.getVendors).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: vendors,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.getVendors.mockRejectedValue(error);

      await procurementController.getVendors(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getVendorById', () => {
    it('should return a vendor if found', async () => {
      const vendor = {
        id: '123',
        name: 'Test Vendor'
      };
      procurementService.getVendorById.mockResolvedValue(vendor);
      req.params.id = '123';

      await procurementController.getVendorById(req, res, next);

      expect(procurementService.getVendorById).toHaveBeenCalledWith('123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: vendor,
      });
    });

    it('should return a 404 error if the vendor is not found', async () => {
      procurementService.getVendorById.mockResolvedValue(null);
      req.params.id = '123';

      await procurementController.getVendorById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Vendor not found',
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.getVendorById.mockRejectedValue(error);

      await procurementController.getVendorById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('approveVendor', () => {
    it('should approve a vendor and return the result', async () => {
      const result = {
        success: true
      };
      procurementService.approveVendor.mockResolvedValue(result);
      req.params.id = '123';

      await procurementController.approveVendor(req, res, next);

      expect(procurementService.approveVendor).toHaveBeenCalledWith('123', 'test-user-id');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.approveVendor.mockRejectedValue(error);

      await procurementController.approveVendor(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('blacklistVendor', () => {
    it('should blacklist a vendor and return the result', async () => {
      const result = {
        success: true
      };
      procurementService.blacklistVendor.mockResolvedValue(result);
      req.params.id = '123';

      await procurementController.blacklistVendor(req, res, next);

      expect(procurementService.blacklistVendor).toHaveBeenCalledWith('123', 'test-user-id');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.blacklistVendor.mockRejectedValue(error);

      await procurementController.blacklistVendor(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createTender', () => {
    it('should create a tender and return it', async () => {
      const tender = {
        id: '123',
        title: 'Test Tender'
      };
      procurementService.createTender.mockResolvedValue(tender);
      req.body = tender;

      await procurementController.createTender(req, res, next);

      expect(procurementService.createTender).toHaveBeenCalledWith(tender);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: tender,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.createTender.mockRejectedValue(error);

      await procurementController.createTender(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getTenderById', () => {
    it('should return a tender if found', async () => {
      const tender = {
        id: '123',
        title: 'Test Tender'
      };
      procurementService.getTenderById.mockResolvedValue(tender);
      req.params.id = '123';

      await procurementController.getTenderById(req, res, next);

      expect(procurementService.getTenderById).toHaveBeenCalledWith('123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: tender,
      });
    });

    it('should return a 404 error if the tender is not found', async () => {
      procurementService.getTenderById.mockResolvedValue(null);
      req.params.id = '123';

      await procurementController.getTenderById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Tender not found',
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.getTenderById.mockRejectedValue(error);

      await procurementController.getTenderById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getTenders', () => {
    it('should return a list of tenders', async () => {
      const tenders = [
        {
          id: '123',
          title: 'Test Tender 1'
        },
        {
          id: '456',
          title: 'Test Tender 2'
        },
      ];
      procurementService.getTenders.mockResolvedValue(tenders);

      await procurementController.getTenders(req, res, next);

      expect(procurementService.getTenders).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: tenders,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.getTenders.mockRejectedValue(error);

      await procurementController.getTenders(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('publishTender', () => {
    it('should publish a tender and return the result', async () => {
      const result = {
        success: true
      };
      procurementService.publishTender.mockResolvedValue(result);
      req.params.id = '123';

      await procurementController.publishTender(req, res, next);

      expect(procurementService.publishTender).toHaveBeenCalledWith('123', 'test-user-id');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.publishTender.mockRejectedValue(error);

      await procurementController.publishTender(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('closeTender', () => {
    it('should close a tender and return the result', async () => {
      const result = {
        success: true
      };
      procurementService.closeTender.mockResolvedValue(result);
      req.params.id = '123';

      await procurementController.closeTender(req, res, next);

      expect(procurementService.closeTender).toHaveBeenCalledWith('123', 'test-user-id');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.closeTender.mockRejectedValue(error);

      await procurementController.closeTender(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createBid', () => {
    it('should create a bid and return it', async () => {
      const bid = {
        id: '123',
        tenderId: '456',
        vendorId: '789',
        amount: 1000,
      };
      procurementService.createBid.mockResolvedValue(bid);
      req.body = bid;

      await procurementController.createBid(req, res, next);

      expect(procurementService.createBid).toHaveBeenCalledWith(bid);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: bid,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.createBid.mockRejectedValue(error);

      await procurementController.createBid(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getBids', () => {
    it('should return a list of bids', async () => {
      const bids = [
        {
          id: '123',
          amount: 1000
        },
        {
          id: '456',
          amount: 2000
        },
      ];
      procurementService.getBids.mockResolvedValue(bids);

      await procurementController.getBids(req, res, next);

      expect(procurementService.getBids).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: bids,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.getBids.mockRejectedValue(error);

      await procurementController.getBids(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getBidById', () => {
    it('should return a bid if found', async () => {
      const bid = {
        id: '123',
        amount: 1000
      };
      procurementService.getBidById.mockResolvedValue(bid);
      req.params.id = '123';

      await procurementController.getBidById(req, res, next);

      expect(procurementService.getBidById).toHaveBeenCalledWith('123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: bid,
      });
    });

    it('should return a 404 error if the bid is not found', async () => {
      procurementService.getBidById.mockResolvedValue(null);
      req.params.id = '123';

      await procurementController.getBidById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Bid not found',
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.getBidById.mockRejectedValue(error);

      await procurementController.getBidById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('evaluateBid', () => {
    it('should evaluate a bid and return the result', async () => {
      const result = {
        success: true
      };
      procurementService.evaluateBid.mockResolvedValue(result);
      req.params.id = '123';
      req.body = {
        score: 95,
        comments: 'Excellent bid'
      };

      await procurementController.evaluateBid(req, res, next);

      expect(procurementService.evaluateBid).toHaveBeenCalledWith('123', 'test-user-id', 95, 'Excellent bid');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.evaluateBid.mockRejectedValue(error);

      await procurementController.evaluateBid(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getEvaluationCommittee', () => {
    it('should return the evaluation committee for a tender', async () => {
      const committee = [
        {
          id: '1',
          name: 'User 1'
        },
        {
          id: '2',
          name: 'User 2'
        },
      ];
      procurementService.getEvaluationCommittee.mockResolvedValue(committee);
      req.params.tenderId = '123';

      await procurementController.getEvaluationCommittee(req, res, next);

      expect(procurementService.getEvaluationCommittee).toHaveBeenCalledWith('123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: committee,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.getEvaluationCommittee.mockRejectedValue(error);

      await procurementController.getEvaluationCommittee(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createOrUpdateEvaluationCommittee', () => {
    it('should create or update an evaluation committee and return the result', async () => {
      const result = {
        success: true
      };
      procurementService.createOrUpdateEvaluationCommittee.mockResolvedValue(result);
      req.body = {
        tenderId: '123',
        members: ['1', '2']
      };

      await procurementController.createOrUpdateEvaluationCommittee(req, res, next);

      expect(procurementService.createOrUpdateEvaluationCommittee).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.createOrUpdateEvaluationCommittee.mockRejectedValue(error);

      await procurementController.createOrUpdateEvaluationCommittee(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createContract', () => {
    it('should create a contract and return it', async () => {
      const contract = {
        id: '123',
        title: 'Test Contract'
      };
      procurementService.createContract.mockResolvedValue(contract);
      req.body = contract;

      await procurementController.createContract(req, res, next);

      expect(procurementService.createContract).toHaveBeenCalledWith(contract);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: contract,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.createContract.mockRejectedValue(error);

      await procurementController.createContract(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getContracts', () => {
    it('should return a list of contracts', async () => {
      const contracts = [
        {
          id: '123',
          title: 'Test Contract 1'
        },
        {
          id: '456',
          title: 'Test Contract 2'
        },
      ];
      procurementService.getContracts.mockResolvedValue(contracts);

      await procurementController.getContracts(req, res, next);

      expect(procurementService.getContracts).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: contracts,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.getContracts.mockRejectedValue(error);

      await procurementController.getContracts(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getContractById', () => {
    it('should return a contract if found', async () => {
      const contract = {
        id: '123',
        title: 'Test Contract'
      };
      procurementService.getContractById.mockResolvedValue(contract);
      req.params.id = '123';

      await procurementController.getContractById(req, res, next);

      expect(procurementService.getContractById).toHaveBeenCalledWith('123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: contract,
      });
    });

    it('should return a 404 error if the contract is not found', async () => {
      procurementService.getContractById.mockResolvedValue(null);
      req.params.id = '123';

      await procurementController.getContractById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Contract not found',
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.getContractById.mockRejectedValue(error);

      await procurementController.getContractById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateContract', () => {
    it('should update a contract and return the result', async () => {
      const result = {
        success: true
      };
      procurementService.updateContract.mockResolvedValue(result);
      req.params.id = '123';
      req.body = {
        title: 'Updated Title'
      };

      await procurementController.updateContract(req, res, next);

      expect(procurementService.updateContract).toHaveBeenCalledWith('123', req.body);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.updateContract.mockRejectedValue(error);

      await procurementController.updateContract(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('amendContract', () => {
    it('should amend a contract and return the result', async () => {
      const result = {
        success: true
      };
      procurementService.amendContract.mockResolvedValue(result);
      req.params.id = '123';
      req.body = {
        clauses: 'New clauses'
      };

      await procurementController.amendContract(req, res, next);

      expect(procurementService.amendContract).toHaveBeenCalledWith('123', req.body, 'test-user-id');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.amendContract.mockRejectedValue(error);

      await procurementController.amendContract(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAuditTrails', () => {
    it('should return a list of audit trails', async () => {
      const logs = [
        {
          id: '1',
          action: 'Created request'
        },
        {
          id: '2',
          action: 'Approved request'
        },
      ];
      procurementService.getAuditTrails.mockResolvedValue(logs);

      await procurementController.getAuditTrails(req, res, next);

      expect(procurementService.getAuditTrails).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: logs,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.getAuditTrails.mockRejectedValue(error);

      await procurementController.getAuditTrails(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getProcurementActivityReport', () => {
    it('should return a procurement activity report', async () => {
      const report = {
        totalRequests: 10,
        approvedRequests: 5
      };
      procurementService.getProcurementActivityReport.mockResolvedValue(report);

      await procurementController.getProcurementActivityReport(req, res, next);

      expect(procurementService.getProcurementActivityReport).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: report,
      });
    });

    it('should call next with an error if the service throws an error', async () => {
      const error = new Error('Test Error');
      procurementService.getProcurementActivityReport.mockRejectedValue(error);

      await procurementController.getProcurementActivityReport(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
