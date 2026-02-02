const ProcurementService = require('../../src/modules/procurement/service');
const { ProcurementRequest } = require('../../src/modules/procurement/model');

jest.mock('../../src/modules/procurement/model');

describe('Procurement Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRequest', () => {
    it('should create procurement request', async () => {
      const mockRequest = { id: 1, itemName: 'Laptop', quantity: 5, status: 'pending' };
      ProcurementRequest.create.mockResolvedValue(mockRequest);

      const result = await ProcurementService.createRequest({ itemName: 'Laptop', quantity: 5 });

      expect(result.status).toBe('pending');
      expect(ProcurementRequest.create).toHaveBeenCalled();
    });
  });

  describe('approveRequest', () => {
    it('should approve request', async () => {
      const mockRequest = { id: 1, status: 'pending', save: jest.fn() };
      ProcurementRequest.findByPk.mockResolvedValue(mockRequest);

      await ProcurementService.approveRequest(1, 2);

      expect(mockRequest.status).toBe('approved');
      expect(mockRequest.save).toHaveBeenCalled();
    });
  });
});
