const express = require("express");
const router = express.Router();
const ProcurementController = require("./controller");
const ProcurementService = require("./service");

const procurementService = new ProcurementService();
const procurementController = new ProcurementController(procurementService);

// Procurement Requests
router.post("/requests", procurementController.createProcurementRequest.bind(procurementController));
router.get("/requests/:id", procurementController.getProcurementRequestById.bind(procurementController));
router.get("/requests", procurementController.getProcurementRequests.bind(procurementController));
router.put("/requests/:id/status", procurementController.updateRequestStatus.bind(procurementController));
router.post("/requests/:id/approvals", procurementController.addRequestApproval.bind(procurementController));
router.post("/requests/:id/submit", procurementController.submitProcurementRequest.bind(procurementController));
router.post("/requests/:id/approve", procurementController.approveProcurementRequest.bind(procurementController));
router.post("/requests/:id/reject", procurementController.rejectProcurementRequest.bind(procurementController));

// Vendors
router.post("/vendors", procurementController.createVendor.bind(procurementController));
router.get("/vendors/:id", procurementController.getVendorById.bind(procurementController));
router.get("/vendors", procurementController.getVendors.bind(procurementController));
router.post("/vendors/:id/approve", procurementController.approveVendor.bind(procurementController));
router.post("/vendors/:id/blacklist", procurementController.blacklistVendor.bind(procurementController));

// Tenders
router.post("/tenders", procurementController.createTender.bind(procurementController));
router.get("/tenders/:id", procurementController.getTenderById.bind(procurementController));
router.get("/tenders", procurementController.getTenders.bind(procurementController));
router.post("/tenders/:id/publish", procurementController.publishTender.bind(procurementController));
router.post("/tenders/:id/close", procurementController.closeTender.bind(procurementController));

// Bids
router.post("/bids", procurementController.createBid.bind(procurementController));
router.get("/bids/:id", procurementController.getBidById.bind(procurementController));
router.get("/bids", procurementController.getBids.bind(procurementController));
router.put("/bids/:id/evaluate", procurementController.evaluateBid.bind(procurementController));

// Bid Evaluation Committees
router.get("/evaluation-committees/:tenderId", procurementController.getEvaluationCommittee.bind(procurementController));
router.post("/evaluation-committees", procurementController.createOrUpdateEvaluationCommittee.bind(procurementController));

// Contracts
router.post("/contracts", procurementController.createContract.bind(procurementController));
router.get("/contracts/:id", procurementController.getContractById.bind(procurementController));
router.get("/contracts", procurementController.getContracts.bind(procurementController));
router.put("/contracts/:id", procurementController.updateContract.bind(procurementController));
router.post("/contracts/:id/amend", procurementController.amendContract.bind(procurementController));

// Reports and Audit Trails
router.get("/reports/activity", procurementController.getProcurementActivityReport.bind(procurementController));
router.get("/audit-trails", procurementController.getAuditTrails.bind(procurementController));

module.exports = router;
