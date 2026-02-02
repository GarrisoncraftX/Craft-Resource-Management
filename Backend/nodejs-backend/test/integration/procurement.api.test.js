const request = require('supertest');
const express = require('express');
const procurementRoutes = require('../../src/modules/procurement/routes');

const app = express();
app.use(express.json());
app.use('/api/procurement', procurementRoutes);

describe('Procurement API - Integration Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Setup auth token
  });

  describe('POST /api/procurement/request', () => {
    it('should create procurement request', async () => {
      const response = await request(app)
        .post('/api/procurement/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemName: 'Office Supplies',
          quantity: 10,
          estimatedCost: 500
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('GET /api/procurement/requests', () => {
    it('should get all requests', async () => {
      const response = await request(app)
        .get('/api/procurement/requests')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PUT /api/procurement/request/:id/approve', () => {
    it('should approve request', async () => {
      const response = await request(app)
        .put('/api/procurement/request/1/approve')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });
});
