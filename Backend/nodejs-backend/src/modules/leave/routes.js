const express = require("express")
const router = express.Router()
const LeaveController = require("./controller")
const LeaveService = require("./service")

const leaveService = new LeaveService()
const leaveController = new LeaveController(leaveService)

router.get("/types", leaveController.getLeaveTypes.bind(leaveController))
router.post("/types", leaveController.createLeaveType.bind(leaveController))
router.post("/requests", leaveController.createLeaveRequest.bind(leaveController))
router.get("/requests", leaveController.getUserLeaveRequests.bind(leaveController))
router.get("/requests/:userId", leaveController.getUserLeaveRequests.bind(leaveController))
router.put("/requests/:id/status", leaveController.updateLeaveRequestStatus.bind(leaveController))

router.get("/balances/:userId", leaveController.getLeaveBalances.bind(leaveController))
router.post("/requests/:id/approve", leaveController.approveLeaveRequest.bind(leaveController))
router.post("/requests/:id/reject", leaveController.rejectLeaveRequest.bind(leaveController))

module.exports = router
