const request = require('supertest');
const express = require('express');
const leaveRoutes = require('../../src/modules/leave/routes');
const authRoutes = require('../../src/modules/auth/routes');
const { sequelize } = require('../../src/config/sequelize');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/leave', leaveRoutes);

describe('Leave Management API - Integration Tests', () => {
  let employeeToken;
  let managerToken;
  let leaveRequestId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Register employee
    const empResponse = await request(app)
      .post('/api/auth/register')
      .send({
        employeeId: 'EMP001',
        email: 'employee@example.com',
        password: 'password123',
        firstName: 'Employee',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
        departmentId: 1,
        roleId: 5
      });

    const empSignin = await request(app)
      .post('/api/auth/signin')
      .send({ employeeId: 'EMP001', password: 'password123' });
    employeeToken = empSignin.body.token;

    // Register manager
    const mgrResponse = await request(app)
      .post('/api/auth/register')
      .send({
        employeeId: 'MGR001',
        email: 'manager@example.com',
        password: 'password123',
        firstName: 'Manager',
        lastName: 'User',
        dateOfBirth: '1985-01-01',
        departmentId: 1,
        roleId: 3
      });

    const mgrSignin = await request(app)
      .post('/api/auth/signin')
      .send({ employeeId: 'MGR001', password: 'password123' });
    managerToken = mgrSignin.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/leave/types', () => {
    it('should get all leave types', async () => {
      const response = await request(app)
        .get('/api/leave/types')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/leave/request', () => {
    it('should create a leave request', async () => {
      const response = await request(app)
        .post('/api/leave/request')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveTypeId: 1,
          startDate: '2024-06-01',
          endDate: '2024-06-05',
          reason: 'Family vacation'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('pending');
      leaveRequestId = response.body.id;
    });

    it('should return 400 for invalid date range', async () => {
      const response = await request(app)
        .post('/api/leave/request')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveTypeId: 1,
          startDate: '2024-06-10',
          endDate: '2024-06-05',
          reason: 'Invalid dates'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/leave/requests', () => {
    it('should get user leave requests', async () => {
      const response = await request(app)
        .get('/api/leave/requests')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/leave/requests?status=pending')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.every(req => req.status === 'pending')).toBe(true);
    });
  });

  describe('GET /api/leave/balance', () => {
    it('should get leave balances', async () => {
      const response = await request(app)
        .get('/api/leave/balance')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PUT /api/leave/request/:id/approve', () => {
    it('should approve leave request as manager', async () => {
      const response = await request(app)
        .put(`/api/leave/request/${leaveRequestId}/approve`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('approved');
    });

    it('should return 403 if employee tries to approve', async () => {
      const response = await request(app)
        .put(`/api/leave/request/${leaveRequestId}/approve`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/leave/request/:id/reject', () => {
    it('should reject leave request as manager', async () => {
      // Create another request
      const createResponse = await request(app)
        .post('/api/leave/request')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveTypeId: 1,
          startDate: '2024-07-01',
          endDate: '2024-07-03',
          reason: 'Personal'
        });

      const newRequestId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/leave/request/${newRequestId}/reject`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ reason: 'Insufficient staffing' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('rejected');
    });
  });

  describe('GET /api/leave/statistics', () => {
    it('should get leave statistics', async () => {
      const response = await request(app)
        .get('/api/leave/statistics')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('pendingRequests');
      expect(response.body).toHaveProperty('approvedToday');
    });
  });
});
