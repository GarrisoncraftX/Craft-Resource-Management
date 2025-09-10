const PayrollService = require("./service");

class PayrollController {
  constructor() {
    this.payrollService = new PayrollService();
  }

  async createPayrollRecord(req, res) {
    try {
      const record = await this.payrollService.createPayrollRecord(req.body);
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPayrollRecordsByUser(req, res) {
    try {
      const records = await this.payrollService.getPayrollRecordsByUser(req.params.userId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPayrollRecordById(req, res) {
    try {
      const record = await this.payrollService.getPayrollRecordById(req.params.id);
      if (!record) return res.status(404).json({ error: "Record not found" });
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updatePayrollRecord(req, res) {
    try {
      const updated = await this.payrollService.updatePayrollRecord(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: "Record not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deletePayrollRecord(req, res) {
    try {
      const deleted = await this.payrollService.deletePayrollRecord(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Record not found" });
      res.json({ message: "Record deleted" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new PayrollController();
