const { sequelize } = require('../src/config/sequelize');
const { LeaveType, LeaveRequest, LeaveBalance, LeaveApproval } = require('../src/modules/leave/model');

describe('Leave Models', () => {
  it('should define LeaveType model correctly', () => {
    expect(LeaveType).toBeDefined();
    expect(sequelize.isDefined('LeaveType')).toBe(true);
  });

  it('should define LeaveRequest model correctly', () => {
    expect(LeaveRequest).toBeDefined();
    expect(sequelize.isDefined('LeaveRequest')).toBe(true);
  });

  it('should define LeaveBalance model correctly', () => {
    expect(LeaveBalance).toBeDefined();
    expect(sequelize.isDefined('LeaveBalance')).toBe(true);
  });

  it('should define LeaveApproval model correctly', () => {
    expect(LeaveApproval).toBeDefined();
    expect(sequelize.isDefined('LeaveApproval')).toBe(true);
  });

  it('should have correct associations for LeaveType', () => {
    const associations = LeaveType.associations;
    expect(Object.keys(associations)).toContain('LeaveRequests');
    expect(Object.keys(associations)).toContain('LeaveBalances');
  });

  it('should have correct associations for LeaveRequest', () => {
    const associations = LeaveRequest.associations;
    expect(Object.keys(associations)).toContain('LeaveType');
    expect(Object.keys(associations)).toContain('LeaveApprovals');
  });

  it('should have correct associations for LeaveBalance', () => {
    const associations = LeaveBalance.associations;
    expect(Object.keys(associations)).toContain('LeaveType');
  });

  it('should have correct associations for LeaveApproval', () => {
    const associations = LeaveApproval.associations;
    expect(Object.keys(associations)).toContain('LeaveRequest');
  });
});
