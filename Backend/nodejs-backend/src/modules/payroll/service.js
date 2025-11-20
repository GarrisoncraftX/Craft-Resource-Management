const PayrollHistory = require("./model");
const auditService = require("../audit/service");

class PayrollService {
  async createPayrollRecord(data) {
    const record = await PayrollHistory.create(data);
    await auditService.logAction(data.userId, "CREATE_PAYROLL_RECORD", {
      recordId: record.id,
      userId: data.userId,
      period: data.period
    });
    return record;
  }

  async getPayrollRecordsByUser(userId) {
    return await PayrollHistory.findAll({
      where: { userId },
      order: [["period", "DESC"]],
    });
  }

  async getAllPayrollRecords() {
    return await PayrollHistory.findAll({
      order: [["period", "DESC"]],
    });
  }

  async getPayrollRecordById(id) {
    return await PayrollHistory.findByPk(id);
  }

  async updatePayrollRecord(id, data) {
    const record = await PayrollHistory.findByPk(id);
    if (!record) return null;
    const updatedRecord = await record.update(data);
    await auditService.logAction(data.userId, "UPDATE_PAYROLL_RECORD", {
      recordId: id,
      userId: data.userId,
      period: data.period
    });
    return updatedRecord;
  }

  async deletePayrollRecord(id, userId) {
    const record = await PayrollHistory.findByPk(id);
    if (!record) return null;
    await record.destroy();
    await auditService.logAction(userId, "DELETE_PAYROLL_RECORD", {
      recordId: id,
      userId: userId
    });
    return true;
  }
}

module.exports = PayrollService;
