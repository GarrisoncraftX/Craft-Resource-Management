const express = require("express")
const router = express.Router()
const multer = require("multer")
const LeaveController = require("./controller")
const LeaveService = require("./service")

const leaveService = new LeaveService()
const leaveController = new LeaveController(leaveService)

// Configure multer for file uploads (memory storage for direct Cloudinary upload)
const upload = multer({ storage: multer.memoryStorage() })

router.get("/types", leaveController.getLeaveTypes.bind(leaveController))
router.post("/types", leaveController.createLeaveType.bind(leaveController))
router.put("/types/:id", leaveController.updateLeaveType.bind(leaveController))
router.delete("/types/:id", leaveController.deleteLeaveType.bind(leaveController))
router.post("/requests", upload.array('supportingDocuments'), leaveController.createLeaveRequest.bind(leaveController))
router.get("/requests/:userId", leaveController.getUserLeaveRequests.bind(leaveController))
router.get("/requests", leaveController.getAllLeaveRequests.bind(leaveController))
router.put("/requests/:id/status", leaveController.updateLeaveRequestStatus.bind(leaveController))


router.get("/balances/:userId", leaveController.getLeaveBalances.bind(leaveController))
router.get("/balances", leaveController.getAllLeaveBalances.bind(leaveController))
router.post("/balances/initialize/:userId", leaveController.initializeLeaveBalances.bind(leaveController))
router.post("/requests/:id/approve", leaveController.approveLeaveRequest.bind(leaveController))
router.post("/requests/:id/reject", leaveController.rejectLeaveRequest.bind(leaveController))
router.post("/requests/:id/complete", leaveController.completeLeaveRequest.bind(leaveController))
router.post("/process-expired", leaveController.processExpiredLeaves.bind(leaveController))
router.get("/employees-on-leave", leaveController.getEmployeesOnLeave.bind(leaveController))
router.get("/statistics", leaveController.getLeaveStatistics.bind(leaveController))
router.get("/low-balance", leaveController.getLowLeaveBalanceEmployees.bind(leaveController))

module.exports = router
