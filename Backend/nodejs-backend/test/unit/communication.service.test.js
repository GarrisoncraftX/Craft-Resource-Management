const CommunicationService = require('../../src/modules/communication/service');
const { Message } = require('../../src/modules/communication/model');

jest.mock('../../src/modules/communication/model');

describe('Communication Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const mockMessage = { id: 1, senderId: 1, recipientId: 2, content: 'Test' };
      Message.create.mockResolvedValue(mockMessage);

      const result = await CommunicationService.sendMessage(1, 2, 'Test');

      expect(result).toBeDefined();
      expect(Message.create).toHaveBeenCalled();
    });
  });

  describe('getMessages', () => {
    it('should retrieve messages', async () => {
      const mockMessages = [{ id: 1, content: 'Test' }];
      Message.findAll.mockResolvedValue(mockMessages);

      const result = await CommunicationService.getMessages(1);

      expect(result.length).toBe(1);
    });
  });
});
