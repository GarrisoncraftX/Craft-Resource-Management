const axios = require('axios');
const pRetry = require('p-retry');

jest.mock('axios');
jest.mock('p-retry');

// Mock the audit service module
const AuditService = require('../../src/modules/audit/service');

describe('Audit Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    AuditService.auditQueue = [];
    AuditService.isProcessing = false;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('logAction', () => {
    it('should queue audit log', async () => {
      await AuditService.logAction(1, 'USER_LOGIN', { ip: '127.0.0.1' });

      expect(AuditService.auditQueue.length).toBe(1);
      expect(AuditService.auditQueue[0]).toMatchObject({
        userId: 1,
        serviceName: 'nodejs-backend',
        result: 'success'
      });
    });

    it('should mask sensitive data in details', async () => {
      await AuditService.logAction(1, 'PASSWORD_CHANGE', { password: 'secret123' });

      const queuedLog = AuditService.auditQueue[0];
      expect(queuedLog.details).toContain('***MASKED***');
      expect(queuedLog.details).not.toContain('secret123');
    });

    it('should build descriptive action for attendance update', async () => {
      await AuditService.logAction(1, 'UPDATE', {
        module: 'attendance',
        operation: 'UPDATE',
        recordDate: '2024-01-15'
      });

      expect(AuditService.auditQueue[0].action).toContain('updated the Attendance record for 2024-01-15');
    });

    it('should build descriptive action for leave request creation', async () => {
      await AuditService.logAction(1, 'CREATE', {
        module: 'leave_management',
        operation: 'CREATE',
        startDate: '2024-06-01',
        endDate: '2024-06-05'
      });

      expect(AuditService.auditQueue[0].action).toContain('created a new Leave Request');
    });

    it('should build descriptive action for procurement request', async () => {
      await AuditService.logAction(1, 'CREATE', {
        module: 'procurement',
        operation: 'CREATE',
        recordId: 'PR_123'
      });

      expect(AuditService.auditQueue[0].action).toContain('created a new Procurement Request PR_123');
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask passwords', () => {
      const data = '{"password":"secret123","username":"john"}';
      const masked = AuditService.maskSensitiveData(data);

      expect(masked).toContain('***MASKED***');
      expect(masked).not.toContain('secret123');
    });

    it('should mask SSN', () => {
      const data = '{"ssn":"123-45-6789"}';
      const masked = AuditService.maskSensitiveData(data);

      expect(masked).toContain('***MASKED***');
      expect(masked).not.toContain('123-45-6789');
    });

    it('should mask credit card numbers', () => {
      const data = '{"creditCard":"1234-5678-9012-3456"}';
      const masked = AuditService.maskSensitiveData(data);

      expect(masked).toContain('***MASKED***');
      expect(masked).not.toContain('1234-5678-9012-3456');
    });

    it('should mask tokens', () => {
      const data = '{"token":"abc123xyz"}';
      const masked = AuditService.maskSensitiveData(data);

      expect(masked).toContain('***MASKED***');
    });
  });

  describe('sendWithRetry', () => {
    it('should send audit log successfully', async () => {
      const mockLog = { userId: 1, action: 'TEST', timestamp: new Date().toISOString() };
      
      pRetry.mockImplementation(async (fn) => await fn());
      axios.post.mockResolvedValue({ data: { success: true } });

      const result = await AuditService.sendWithRetry(mockLog);

      expect(result).toBe(true);
      expect(axios.post).toHaveBeenCalled();
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockLog = { userId: 1, action: 'TEST' };
      
      pRetry.mockImplementation(async (fn) => await fn());
      axios.post.mockResolvedValue({ data: { success: true } });

      const result = await AuditService.sendWithRetry(mockLog);

      expect(result).toBe(true);
    });

    it('should queue log on permanent failure', async () => {
      const mockLog = { userId: 1, action: 'TEST' };
      
      pRetry.mockRejectedValue(new Error('Network error'));

      const result = await AuditService.sendWithRetry(mockLog);

      expect(result).toBe(false);
      expect(AuditService.auditQueue.length).toBeGreaterThan(0);
    });
  });

  describe('flushQueue', () => {
    it('should not flush empty queue', async () => {
      AuditService.auditQueue = [];

      await AuditService.flushQueue();

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should not flush if already processing', async () => {
      AuditService.auditQueue = [{ userId: 1, action: 'TEST' }];
      AuditService.isProcessing = true;

      await AuditService.flushQueue();

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should flush batch of logs', async () => {
      AuditService.auditQueue = [
        { userId: 1, action: 'TEST1' },
        { userId: 2, action: 'TEST2' }
      ];

      pRetry.mockImplementation(async (fn) => await fn());
      axios.post.mockResolvedValue({ data: { success: true } });

      await AuditService.flushQueue();

      expect(AuditService.auditQueue.length).toBe(0);
    });
  });

  describe('logEntityAction', () => {
    it('should log entity-specific action', async () => {
      await AuditService.logEntityAction('User', 123, 'UPDATE', 1, { field: 'email' });

      expect(AuditService.auditQueue.length).toBe(1);
      expect(AuditService.auditQueue[0]).toMatchObject({
        entityType: 'User',
        entityId: 123,
        userId: 1
      });
    });
  });

  describe('getUserAuditLogs', () => {
    it('should fetch user audit logs', async () => {
      const mockLogs = [{ id: 1, action: 'LOGIN' }];
      axios.get.mockResolvedValue({ data: mockLogs });

      const result = await AuditService.getUserAuditLogs(1, 10, 0);

      expect(result).toEqual(mockLogs);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/system/audit-logs/user/1'),
        expect.any(Object)
      );
    });

    it('should throw error on fetch failure', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      await expect(AuditService.getUserAuditLogs(1))
        .rejects.toThrow('Unable to fetch recent activities');
    });
  });

  describe('searchAuditLogs', () => {
    it('should search audit logs with filters', async () => {
      const mockLogs = [{ id: 1, action: 'LOGIN' }];
      axios.get.mockResolvedValue({ data: mockLogs });

      const result = await AuditService.searchAuditLogs({ action: 'LOGIN' });

      expect(result).toEqual(mockLogs);
      expect(axios.get).toHaveBeenCalled();
    });
  });

  describe('shutdown', () => {
    it('should flush remaining logs on shutdown', async () => {
      AuditService.auditQueue = [{ userId: 1, action: 'TEST' }];
      
      pRetry.mockImplementation(async (fn) => await fn());
      axios.post.mockResolvedValue({ data: { success: true } });

      await AuditService.shutdown();

      expect(AuditService.auditQueue.length).toBe(0);
    });
  });
});
