const PublicRelationsService = require('../../src/modules/publicRelations/service');
const { PREvent } = require('../../src/modules/publicRelations/model');

jest.mock('../../src/modules/publicRelations/model');

describe('Public Relations Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create PR event', async () => {
      const mockEvent = { id: 1, title: 'Press Conference', status: 'scheduled' };
      PREvent.create.mockResolvedValue(mockEvent);

      const result = await PublicRelationsService.createEvent({ title: 'Press Conference' });

      expect(result.status).toBe('scheduled');
    });
  });

  describe('getEvents', () => {
    it('should retrieve events', async () => {
      const mockEvents = [{ id: 1, title: 'Event' }];
      PREvent.findAll.mockResolvedValue(mockEvents);

      const result = await PublicRelationsService.getEvents();

      expect(result.length).toBe(1);
    });
  });
});
