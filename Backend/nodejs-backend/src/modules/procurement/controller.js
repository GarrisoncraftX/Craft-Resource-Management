class ProcurementController {
  constructor(procurementService) {
    this.procurementService = procurementService;
  }

  async createProcurementRequest(req, res, next) {
    try {
      const procurementRequest = await this.procurementService.createProcurementRequest(req.body);
      res.status(201).json({ success: true, data: procurementRequest });
    } catch (error) {
      next(error);
    }
  }

  async getProcurementRequestById(req, res, next) {
    try {
      const request = await this.procurementService.getProcurementRequestById(req.params.id);
      if (!request) {
        return res.status(404).json({ success: false, message: "Procurement request not found" });
      }
      res.json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  }

  async getProcurementRequests(req, res, next) {
    try {
      const requests = await this.procurementService.getProcurementRequests(req.query);
      res.json({ success: true, data: requests });
    } catch (error) {
      next(error);
    }
  }

  async updateRequestStatus(req, res, next) {
    try {
      const { status, updatedBy, comments } = req.body;
      const updatedRequest = await this.procurementService.updateRequestStatus(req.params.id, status, updatedBy, comments);
      if (!updatedRequest) {
        return res.status(404).json({ success: false, message: "Procurement request not found" });
      }
      res.json({ success: true, data: updatedRequest });
    } catch (error) {
      next(error);
    }
  }

  async addRequestApproval(req, res, next) {
    try {
      const { approverId, approvalLevel, status, comments } = req.body;
      const approval = await this.procurementService.addRequestApproval(req.params.id, approverId, approvalLevel, status, comments);
      res.status(201).json({ success: true, data: approval });
    } catch (error) {
      next(error);
    }
  }

  async submitProcurementRequest(req, res, next) {
    try {
      const result = await this.procurementService.submitProcurementRequest(req.params.id, req.userContext.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async approveProcurementRequest(req, res, next) {
    try {
      const result = await this.procurementService.approveProcurementRequest(req.params.id, req.userContext.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async rejectProcurementRequest(req, res, next) {
    try {
      const result = await this.procurementService.rejectProcurementRequest(req.params.id, req.userContext.userId, req.body.reason);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async createVendor(req, res, next) {
    try {
      const vendor = await this.procurementService.createVendor(req.body);
      res.status(201).json({ success: true, data: vendor });
    } catch (error) {
      next(error);
    }
  }

  async getVendorById(req, res, next) {
    try {
      const vendor = await this.procurementService.getVendorById(req.params.id);
      if (!vendor) {
        return res.status(404).json({ success: false, message: "Vendor not found" });
      }
      res.json({ success: true, data: vendor });
    } catch (error) {
      next(error);
    }
  }

  async getVendors(req, res, next) {
    try {
      const vendors = await this.procurementService.getVendors(req.query);
      res.json({ success: true, data: vendors });
    } catch (error) {
      next(error);
    }
  }

  async approveVendor(req, res, next) {
    try {
      const result = await this.procurementService.approveVendor(req.params.id, req.userContext.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async blacklistVendor(req, res, next) {
    try {
      const result = await this.procurementService.blacklistVendor(req.params.id, req.userContext.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async createTender(req, res, next) {
    try {
      const tender = await this.procurementService.createTender(req.body);
      res.status(201).json({ success: true, data: tender });
    } catch (error) {
      next(error);
    }
  }

  async getTenderById(req, res, next) {
    try {
      const tender = await this.procurementService.getTenderById(req.params.id);
      if (!tender) {
        return res.status(404).json({ success: false, message: "Tender not found" });
      }
      res.json({ success: true, data: tender });
    } catch (error) {
      next(error);
    }
  }

  async getTenders(req, res, next) {
    try {
      const tenders = await this.procurementService.getTenders(req.query);
      res.json({ success: true, data: tenders });
    } catch (error) {
      next(error);
    }
  }

  async publishTender(req, res, next) {
    try {
      const result = await this.procurementService.publishTender(req.params.id, req.userContext.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async closeTender(req, res, next) {
    try {
      const result = await this.procurementService.closeTender(req.params.id, req.userContext.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async createBid(req, res, next) {
    try {
      const bid = await this.procurementService.createBid(req.body);
      res.status(201).json({ success: true, data: bid });
    } catch (error) {
      next(error);
    }
  }

  async getBidById(req, res, next) {
    try {
      const bid = await this.procurementService.getBidById(req.params.id);
      if (!bid) {
        return res.status(404).json({ success: false, message: "Bid not found" });
      }
      res.json({ success: true, data: bid });
    } catch (error) {
      next(error);
    }
  }

  async getBids(req, res, next) {
    try {
      const bids = await this.procurementService.getBids(req.query);
      res.json({ success: true, data: bids });
    } catch (error) {
      next(error);
    }
  }

  async evaluateBid(req, res, next) {
    try {
      const result = await this.procurementService.evaluateBid(req.params.id, req.userContext.userId, req.body.score, req.body.comments);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getEvaluationCommittee(req, res, next) {
    try {
      const committee = await this.procurementService.getEvaluationCommittee(req.params.tenderId);
      res.json({ success: true, data: committee });
    } catch (error) {
      next(error);
    }
  }

  async createOrUpdateEvaluationCommittee(req, res, next) {
    try {
      const result = await this.procurementService.createOrUpdateEvaluationCommittee(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async createContract(req, res, next) {
    try {
      const contract = await this.procurementService.createContract(req.body);
      res.status(201).json({ success: true, data: contract });
    } catch (error) {
      next(error);
    }
  }

  async getContractById(req, res, next) {
    try {
      const contract = await this.procurementService.getContractById(req.params.id);
      if (!contract) {
        return res.status(404).json({ success: false, message: "Contract not found" });
      }
      res.json({ success: true, data: contract });
    } catch (error) {
      next(error);
    }
  }

  async getContracts(req, res, next) {
    try {
      const contracts = await this.procurementService.getContracts(req.query);
      res.json({ success: true, data: contracts });
    } catch (error) {
      next(error);
    }
  }

  async updateContract(req, res, next) {
    try {
      const result = await this.procurementService.updateContract(req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async amendContract(req, res, next) {
    try {
      const result = await this.procurementService.amendContract(req.params.id, req.body, req.userContext.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getProcurementActivityReport(req, res, next) {
    try {
      const report = await this.procurementService.getProcurementActivityReport(req.query);
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  async getAuditTrails(req, res, next) {
    try {
      const logs = await this.procurementService.getAuditTrails(req.query);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProcurementController;
