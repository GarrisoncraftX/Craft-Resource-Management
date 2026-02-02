const request = require('supertest');
const express = require('express');
const transportationRoutes = require('../../src/modules/transportation/routes');

const app = express();
app.use(express.json());
app.use('/api/transportation', transportationRoutes);

describe('Transportation API - Integration Tests', () => {
  let authToken;

  describe('POST /api/transportation/request', () => {
    it('should create vehicle request', async () => {
      const response = await request(app)
        .post('/api/transportation/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          purpose: 'Business Meeting',
          destination: 'Downtown Office',
          requestDate: '2024-06-15'
        });

      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/transportation/vehicles', () => {
    it('should get available vehicles', async () => {
      const response = await request(app)
        .get('/api/transportation/vehicles')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });
});
