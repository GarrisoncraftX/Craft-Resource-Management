const express = require("express");
const router = express.Router();
const payrollController = require("./controller");

router.post("/", payrollController.createPayrollRecord.bind(payrollController));
router.get("/user/:userId", payrollController.getPayrollRecordsByUser.bind(payrollController));
router.get("/:id", payrollController.getPayrollRecordById.bind(payrollController));
router.put("/:id", payrollController.updatePayrollRecord.bind(payrollController));
router.delete("/:id", payrollController.deletePayrollRecord.bind(payrollController));

module.exports = router;
