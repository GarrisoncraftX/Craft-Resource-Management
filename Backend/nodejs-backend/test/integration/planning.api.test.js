const request = require('supertest');
const express = require('express');
const planningRoutes = require('../../src/modules/planning/routes');

const app = express();
app.use(express.json());
app.use('/api/planning', planningRoutes);

describe('Planning API - Integration Tests', () => {
  let authToken;

  describe('POST /api/planning/project', () => {
    it('should create project', async () => {
      const response = await request(app)
        .post('/api/planning/project')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Infrastructure Project',
          description: 'Road construction',
          startDate: '2024-07-01',
          endDate: '2024-12-31'
        });

      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/planning/projects', () => {
    it('should get all projects', async () => {
      const response = await request(app)
        .get('/api/planning/projects')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });
});
