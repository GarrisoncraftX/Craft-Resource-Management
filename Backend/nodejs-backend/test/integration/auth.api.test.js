const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/modules/auth/routes');
const { sequelize } = require('../../src/config/sequelize');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth API - Integration Tests', () => {
  let authToken;
  let testUserId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          employeeId: 'TEST001',
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: '1990-01-01',
          departmentId: 1,
          roleId: 1
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      testUserId = response.body.id;
    });

    it('should return 400 for duplicate employee ID', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          employeeId: 'TEST001',
          email: 'another@example.com',
          password: 'password123',
          firstName: 'Another',
          lastName: 'User',
          dateOfBirth: '1990-01-01',
          departmentId: 1,
          roleId: 1
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Employee ID already exists');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          employeeId: 'TEST002',
          email: 'incomplete@example.com'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/signin', () => {
    it('should sign in with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          employeeId: 'TEST001',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      authToken = response.body.token;
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          employeeId: 'TEST001',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/auth/change-password', () => {
    it('should change password with valid token', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });

      expect(response.status).toBe(200);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('employeeId', 'TEST001');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated',
          phone: '1234567890'
        });

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe('Updated');
    });
  });
});
