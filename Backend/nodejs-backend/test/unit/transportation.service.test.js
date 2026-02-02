const TransportationService = require('../../src/modules/transportation/service');
const { VehicleRequest } = require('../../src/modules/transportation/model');

jest.mock('../../src/modules/transportation/model');

describe('Transportation Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestVehicle', () => {
    it('should create vehicle request', async () => {
      const mockRequest = { id: 1, purpose: 'Meeting', status: 'pending' };
      VehicleRequest.create.mockResolvedValue(mockRequest);

      const result = await TransportationService.requestVehicle({ purpose: 'Meeting' });

      expect(result.status).toBe('pending');
    });
  });

  describe('approveRequest', () => {
    it('should approve vehicle request', async () => {
      const mockRequest = { id: 1, status: 'pending', save: jest.fn() };
      VehicleRequest.findByPk.mockResolvedValue(mockRequest);

      await TransportationService.approveRequest(1);

      expect(mockRequest.status).toBe('approved');
    });
  });
});
