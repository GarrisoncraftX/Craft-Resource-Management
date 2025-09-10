const PayrollHistory = require("./model");

class PayrollService {
  async createPayrollRecord(data) {
    return await PayrollHistory.create(data);
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
    return await record.update(data);
  }

  async deletePayrollRecord(id) {
    const record = await PayrollHistory.findByPk(id);
    if (!record) return null;
    await record.destroy();
    return true;
  }
}

module.exports = PayrollService;
