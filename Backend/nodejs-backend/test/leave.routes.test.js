const express = require('express');
const request = require('supertest');
const leaveRoutes = require('../src/modules/leave/routes');
const LeaveController = require('../src/modules/leave/controller');

jest.mock('../src/modules/leave/controller', () => ({
  getLeaveTypes: jest.fn((req, res) => res.json({})),
  createLeaveType: jest.fn((req, res) => res.status(201).json({})),
  createLeaveRequest: jest.fn((req, res) => res.status(201).json({})),
  getUserLeaveRequests: jest.fn((req, res) => res.json({})),
  updateLeaveRequestStatus: jest.fn((req, res) => res.json({})),
  getLeaveBalances: jest.fn((req, res) => res.json({})),
  approveLeaveRequest: jest.fn((req, res) => res.json({})),
  rejectLeaveRequest: jest.fn((req, res) => res.json({})),
}));

const app = express();
app.use(express.json());
app.use('/leave', leaveRoutes);

describe('Leave Routes', () => {
  it('should call getLeaveTypes on GET /leave/types', async () => {
    await request(app).get('/leave/types');
    expect(LeaveController.getLeaveTypes).toHaveBeenCalled();
  });

  it('should call createLeaveType on POST /leave/types', async () => {
    await request(app).post('/leave/types').send({});
    expect(LeaveController.createLeaveType).toHaveBeenCalled();
  });

  it('should call createLeaveRequest on POST /leave/requests', async () => {
    await request(app).post('/leave/requests').send({});
    expect(LeaveController.createLeaveRequest).toHaveBeenCalled();
  });

  it('should call getUserLeaveRequests on GET /leave/requests', async () => {
    await request(app).get('/leave/requests');
    expect(LeaveController.getUserLeaveRequests).toHaveBeenCalled();
  });

  it('should call updateLeaveRequestStatus on PUT /leave/requests/:id/status', async () => {
    await request(app).put('/leave/requests/123/status').send({});
    expect(LeaveController.updateLeaveRequestStatus).toHaveBeenCalled();
  });

  it('should call getLeaveBalances on GET /leave/balances/:userId', async () => {
    await request(app).get('/leave/balances/user123');
    expect(LeaveController.getLeaveBalances).toHaveBeenCalled();
  });

  it('should call approveLeaveRequest on POST /leave/requests/:id/approve', async () => {
    await request(app).post('/leave/requests/123/approve').send({});
    expect(LeaveController.approveLeaveRequest).toHaveBeenCalled();
  });

  it('should call rejectLeaveRequest on POST /leave/requests/:id/reject', async () => {
    await request(app).post('/leave/requests/123/reject').send({});
    expect(LeaveController.rejectLeaveRequest).toHaveBeenCalled();
  });
});
