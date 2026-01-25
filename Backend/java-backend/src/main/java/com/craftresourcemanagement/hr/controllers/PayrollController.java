package com.craftresourcemanagement.hr.controllers;

import com.craftresourcemanagement.hr.entities.*;
import com.craftresourcemanagement.hr.services.PayrollService;
import com.craftresourcemanagement.hr.services.EmployeeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/hr/payroll")
public class PayrollController {

    private static final Logger logger = LoggerFactory.getLogger(PayrollController.class);
    private final PayrollService payrollService;
    private final EmployeeService employeeService;

    public PayrollController(PayrollService payrollService, EmployeeService employeeService) {
        this.payrollService = payrollService;
        this.employeeService = employeeService;
    }

    // PayrollRun endpoints
    @PostMapping("/runs")
    public ResponseEntity<PayrollRun> createPayrollRun(@RequestBody PayrollRun payrollRun) {
        return ResponseEntity.ok(payrollService.createPayrollRun(payrollRun));
    }

    @GetMapping("/runs")
    public ResponseEntity<List<PayrollRun>> getAllPayrollRuns() {
        return ResponseEntity.ok(payrollService.getAllPayrollRuns());
    }

    @GetMapping("/runs/{id}")
    public ResponseEntity<PayrollRun> getPayrollRunById(@PathVariable Long id) {
        PayrollRun run = payrollService.getPayrollRunById(id);
        if (run == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(run);
    }

    @PutMapping("/runs/{id}")
    public ResponseEntity<PayrollRun> updatePayrollRun(@PathVariable Long id, @RequestBody PayrollRun payrollRun) {
        PayrollRun updated = payrollService.updatePayrollRun(id, payrollRun);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/runs/{id}")
    public ResponseEntity<Void> deletePayrollRun(@PathVariable Long id) {
        payrollService.deletePayrollRun(id);
        return ResponseEntity.noContent().build();
    }

    // Payslip endpoints
    @PostMapping("/payslips")
    public ResponseEntity<Payslip> createPayslip(@RequestBody Payslip payslip) {
        return ResponseEntity.ok(payrollService.createPayslip(payslip));
    }

    @GetMapping("/payslips")
    public ResponseEntity<List<Payslip>> getAllPayslips() {
        try {
            List<Payslip> payslips = payrollService.getAllPayslips();
            return ResponseEntity.ok(payslips);
        } catch (Exception e) {
            logger.error("Error fetching payslips: {}", e.getMessage(), e);
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }

    @GetMapping("/payslips/{id}")
    public ResponseEntity<Payslip> getPayslipById(@PathVariable Long id) {
        Payslip payslip = payrollService.getPayslipById(id);
        if (payslip == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(payslip);
    }

    @PutMapping("/payslips/{id}")
    public ResponseEntity<Payslip> updatePayslip(@PathVariable Long id, @RequestBody Payslip payslip) {
        Payslip updated = payrollService.updatePayslip(id, payslip);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/payslips/{id}")
    public ResponseEntity<Void> deletePayslip(@PathVariable Long id) {
        payrollService.deletePayslip(id);
        return ResponseEntity.noContent().build();
    }

    // BenefitPlan endpoints
    @PostMapping("/benefit-plans")
    public ResponseEntity<BenefitPlan> createBenefitPlan(@RequestBody BenefitPlan benefitPlan) {
        return ResponseEntity.ok(payrollService.createBenefitPlan(benefitPlan));
    }

    @GetMapping("/benefit-plans")
    public ResponseEntity<List<BenefitPlan>> getAllBenefitPlans() {
        return ResponseEntity.ok(payrollService.getAllBenefitPlans());
    }

    @GetMapping("/benefit-plans/{id}")
    public ResponseEntity<BenefitPlan> getBenefitPlanById(@PathVariable Long id) {
        BenefitPlan plan = payrollService.getBenefitPlanById(id);
        if (plan == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(plan);
    }

    @PutMapping("/benefit-plans/{id}")
    public ResponseEntity<BenefitPlan> updateBenefitPlan(@PathVariable Long id, @RequestBody BenefitPlan benefitPlan) {
        BenefitPlan updated = payrollService.updateBenefitPlan(id, benefitPlan);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/benefit-plans/{id}")
    public ResponseEntity<Void> deleteBenefitPlan(@PathVariable Long id) {
        payrollService.deleteBenefitPlan(id);
        return ResponseEntity.noContent().build();
    }

    // EmployeeBenefit endpoints
    @PostMapping("/employee-benefits")
    public ResponseEntity<EmployeeBenefit> createEmployeeBenefit(@RequestBody EmployeeBenefit employeeBenefit) {
        return ResponseEntity.ok(payrollService.createEmployeeBenefit(employeeBenefit));
    }

    @GetMapping("/employee-benefits")
    public ResponseEntity<List<EmployeeBenefit>> getAllEmployeeBenefits() {
        return ResponseEntity.ok(payrollService.getAllEmployeeBenefits());
    }

    @GetMapping("/employee-benefits/{id}")
    public ResponseEntity<EmployeeBenefit> getEmployeeBenefitById(@PathVariable Long id) {
        EmployeeBenefit eb = payrollService.getEmployeeBenefitById(id);
        if (eb == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(eb);
    }

    @PutMapping("/employee-benefits/{id}")
    public ResponseEntity<EmployeeBenefit> updateEmployeeBenefit(@PathVariable Long id, @RequestBody EmployeeBenefit employeeBenefit) {
        EmployeeBenefit updated = payrollService.updateEmployeeBenefit(id, employeeBenefit);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/employee-benefits/{id}")
    public ResponseEntity<Void> deleteEmployeeBenefit(@PathVariable Long id) {
        payrollService.deleteEmployeeBenefit(id);
        return ResponseEntity.noContent().build();
    }

    // TrainingCourse endpoints
    @PostMapping("/training-courses")
    public ResponseEntity<TrainingCourse> createTrainingCourse(@RequestBody TrainingCourse trainingCourse) {
        return ResponseEntity.ok(payrollService.createTrainingCourse(trainingCourse));
    }

    @GetMapping("/training-courses")
    public ResponseEntity<List<TrainingCourse>> getAllTrainingCourses() {
        return ResponseEntity.ok(payrollService.getAllTrainingCourses());
    }

    @GetMapping("/training-courses/{id}")
    public ResponseEntity<TrainingCourse> getTrainingCourseById(@PathVariable Long id) {
        TrainingCourse tc = payrollService.getTrainingCourseById(id);
        if (tc == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(tc);
    }

    @PutMapping("/training-courses/{id}")
    public ResponseEntity<TrainingCourse> updateTrainingCourse(@PathVariable Long id, @RequestBody TrainingCourse trainingCourse) {
        TrainingCourse updated = payrollService.updateTrainingCourse(id, trainingCourse);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/training-courses/{id}")
    public ResponseEntity<Void> deleteTrainingCourse(@PathVariable Long id) {
        payrollService.deleteTrainingCourse(id);
        return ResponseEntity.noContent().build();
    }

    // EmployeeTraining endpoints
    @PostMapping("/employee-trainings")
    public ResponseEntity<EmployeeTraining> createEmployeeTraining(@RequestBody EmployeeTraining employeeTraining) {
        return ResponseEntity.ok(payrollService.createEmployeeTraining(employeeTraining));
    }

    @GetMapping("/employee-trainings")
    public ResponseEntity<List<EmployeeTraining>> getAllEmployeeTrainings() {
        return ResponseEntity.ok(payrollService.getAllEmployeeTrainings());
    }

    @GetMapping("/employee-trainings/{id}")
    public ResponseEntity<EmployeeTraining> getEmployeeTrainingById(@PathVariable Long id) {
        EmployeeTraining et = payrollService.getEmployeeTrainingById(id);
        if (et == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(et);
    }

    @PutMapping("/employee-trainings/{id}")
    public ResponseEntity<EmployeeTraining> updateEmployeeTraining(@PathVariable Long id, @RequestBody EmployeeTraining employeeTraining) {
        EmployeeTraining updated = payrollService.updateEmployeeTraining(id, employeeTraining);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/employee-trainings/{id}")
    public ResponseEntity<Void> deleteEmployeeTraining(@PathVariable Long id) {
        payrollService.deleteEmployeeTraining(id);
        return ResponseEntity.noContent().build();
    }

    // PerformanceReview endpoints
    @PostMapping("/performance-reviews")
    public ResponseEntity<PerformanceReview> createPerformanceReview(@RequestBody PerformanceReview performanceReview) {
        return ResponseEntity.ok(payrollService.createPerformanceReview(performanceReview));
    }

    @GetMapping("/performance-reviews")
    public ResponseEntity<List<PerformanceReview>> getAllPerformanceReviews() {
        return ResponseEntity.ok(payrollService.getAllPerformanceReviews());
    }

    @GetMapping("/performance-reviews/{id}")
    public ResponseEntity<PerformanceReview> getPerformanceReviewById(@PathVariable Long id) {
        PerformanceReview pr = payrollService.getPerformanceReviewById(id);
        if (pr == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(pr);
    }

    @PutMapping("/performance-reviews/{id}")
    public ResponseEntity<PerformanceReview> updatePerformanceReview(@PathVariable Long id, @RequestBody PerformanceReview performanceReview) {
        PerformanceReview updated = payrollService.updatePerformanceReview(id, performanceReview);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/performance-reviews/{id}")
    public ResponseEntity<Void> deletePerformanceReview(@PathVariable Long id) {
        payrollService.deletePerformanceReview(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/payslips/user/{userId}")
    public ResponseEntity<List<Payslip>> getPayslipsByUser(@PathVariable Long userId) {
        Optional<User> userOpt = employeeService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            List<Payslip> payslips = payrollService.getPayslipsByUser(userOpt.get());
            return ResponseEntity.ok(payslips);
        } catch (Exception e) {
            logger.error("Error fetching payslips for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/process")
    public ResponseEntity<ProcessPayrollResponse> processPayroll(@RequestBody ProcessPayrollRequest request) {
        try {
            PayrollRun payrollRun = payrollService.processPayroll(
                request.getStartDate(),
                request.getEndDate(),
                request.getPayDate(),
                request.getDepartmentId(),
                request.isIncludeOvertime(),
                request.isIncludeBonuses(),
                request.isIncludeDeductions(),
                request.getCreatedBy()
            );

            List<Payslip> payslips = payrollService.getAllPayslips().stream()
                .filter(p -> p.getPayrollRun() != null && p.getPayrollRun().getId().equals(payrollRun.getId()))
                .toList();

            ProcessPayrollResponse response = new ProcessPayrollResponse(
                payrollRun.getId(),
                payslips.size(),
                "SUCCESS",
                "Payroll processed successfully for " + payslips.size() + " employees"
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing payroll: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(new ProcessPayrollResponse(null, 0, "ERROR", "Failed to process payroll: " + e.getMessage()));
        }
    }

    @GetMapping("/runs/{id}/report")
    public ResponseEntity<String> generatePayrollReport(@PathVariable Long id, @RequestParam(defaultValue = "csv") String format) {
        try {
            PayrollRun run = payrollService.getPayrollRunById(id);
            if (run == null) {
                return ResponseEntity.notFound().build();
            }

            List<Payslip> payslips = payrollService.getAllPayslips().stream()
                .filter(p -> p.getPayrollRun() != null && p.getPayrollRun().getId().equals(id))
                .toList();

            if ("html".equalsIgnoreCase(format)) {
                String htmlReport = generateHTMLReport(run, payslips);
                return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=crmspayroll.report_" + id + ".html")
                    .header("Content-Type", "text/html")
                    .body(htmlReport);
            }

            StringBuilder report = new StringBuilder();
            report.append("Employee ID,Name,Gross Pay,Tax Deductions,Other Deductions,Net Pay\n");
            
            for (Payslip p : payslips) {
                report.append(String.format("%s,%s %s,%.2f,%.2f,%.2f,%.2f\n",
                    p.getUser().getEmployeeId(),
                    p.getUser().getFirstName(),
                    p.getUser().getLastName(),
                    p.getGrossPay(),
                    p.getTaxDeductions(),
                    p.getOtherDeductions(),
                    p.getNetPay()));
            }

            return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=payroll_report_" + id + ".csv")
                .header("Content-Type", "text/csv")
                .body(report.toString());
        } catch (Exception e) {
            logger.error("Error generating report: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private String generateHTMLReport(PayrollRun run, List<Payslip> payslips) {
        double totalGross = payslips.stream().mapToDouble(p -> p.getGrossPay().doubleValue()).sum();
        double totalDeductions = payslips.stream().mapToDouble(p -> p.getTaxDeductions().add(p.getOtherDeductions()).doubleValue()).sum();
        double totalNet = payslips.stream().mapToDouble(p -> p.getNetPay().doubleValue()).sum();
        long processedCount = payslips.stream().filter(p -> "COMPLETED".equals(run.getStatus())).count();

        String logoSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%232563eb' width='100' height='100'/%3E%3Ctext x='50' y='55' font-size='40' fill='white' text-anchor='middle' font-family='Arial' font-weight='bold'%3ECRM%3C/text%3E%3C/svg%3E";

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Payroll Report</title>");
        html.append("<style>@media print{body{margin:0}}body{font-family:Arial,sans-serif;margin:40px}");
        html.append(".header{position:relative;margin-bottom:30px;border-bottom:2px solid #2563eb;padding-bottom:20px}");
        html.append(".header img{position:absolute;left:0;top:0;width:80px;height:80px}");
        html.append(".header-text{text-align:center}.header h1{margin:5px 0;color:#1e293b;font-size:24px}");
        html.append(".header p{margin:3px 0;color:#64748b;font-size:14px}");
        html.append(".info{margin:20px 0;background:#f8fafc;padding:15px;border-radius:8px}.info p{margin:5px 0;color:#334155}");
        html.append("table{width:100%;border-collapse:collapse;margin:20px 0}");
        html.append("th{background:#2563eb;color:white;padding:12px;text-align:left;font-weight:600}");
        html.append("td{padding:10px;border-bottom:1px solid #e2e8f0}tr:hover{background:#f8fafc}");
        html.append(".status-processed{background:#22c55e;color:white;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600}");
        html.append(".totals{margin-top:20px;text-align:right;font-weight:bold;background:#f8fafc;padding:15px;border-radius:8px}");
        html.append(".totals div{margin:5px 0;color:#1e293b}");
        html.append(".footer{margin-top:40px;text-align:center;color:#64748b;font-size:12px;border-top:1px solid #e2e8f0;padding-top:20px}");
        html.append("</style></head><body>");
        html.append("<div class='header'><img src='").append(logoSvg).append("' alt='Logo'>");
        html.append("<div class='header-text'><h1>CRAFT RESOURCE MANAGEMENT</h1><p>Payroll Report</p>");
        html.append("<p>Period: ").append(run.getStartDate()).append(" - ").append(run.getEndDate()).append("</p></div></div>");
        html.append("<div class='info'><p><strong>Report Generated:</strong> ").append(java.time.LocalDateTime.now()).append("</p>");
        html.append("<p><strong>Total Employees:</strong> ").append(payslips.size()).append("</p>");
        html.append("<p><strong>Status:</strong> ").append(processedCount).append(" Processed, ").append(payslips.size() - processedCount).append(" Pending</p></div>");
        html.append("<table><thead><tr><th>Employee Name</th><th>Gross Pay</th><th>Deductions</th><th>Net Pay</th><th>Status</th></tr></thead><tbody>");
        
        for (Payslip p : payslips) {
            html.append("<tr><td>").append(p.getUser().getFirstName()).append(" ").append(p.getUser().getLastName()).append("</td>");
            html.append("<td>$").append(String.format("%.2f", p.getGrossPay())).append("</td>");
            html.append("<td>$").append(String.format("%.2f", p.getTaxDeductions().add(p.getOtherDeductions()))).append("</td>");
            html.append("<td>$").append(String.format("%.2f", p.getNetPay())).append("</td>");
            html.append("<td><span class='status-processed'>Processed</span></td></tr>");
        }
        
        html.append("</tbody></table><div class='totals'>");
        html.append("<div>Total Gross Pay: $").append(String.format("%.2f", totalGross)).append("</div>");
        html.append("<div>Total Deductions: $").append(String.format("%.2f", totalDeductions)).append("</div>");
        html.append("<div>Total Net Pay: $").append(String.format("%.2f", totalNet)).append("</div></div>");
        html.append("<div class='footer'><p>This is an official payroll report generated by Craft Resource Management System</p>");
        html.append("<p>&copy; ").append(java.time.Year.now().getValue()).append(" Craft Resource Management. All rights reserved.</p></div>");
        html.append("<script>window.onload=()=>window.print();</script></body></html>");
        
        return html.toString();
    }

    @GetMapping("/runs/{id}/bank-file")
    public ResponseEntity<String> generateBankFile(@PathVariable Long id) {
        try {
            PayrollRun run = payrollService.getPayrollRunById(id);
            if (run == null) {
                return ResponseEntity.notFound().build();
            }

            List<Payslip> payslips = payrollService.getAllPayslips().stream()
                .filter(p -> p.getPayrollRun() != null && p.getPayrollRun().getId().equals(id))
                .toList();

            StringBuilder bankFile = new StringBuilder();
            bankFile.append("Account Number,Account Name,Bank Name,Amount,Reference\n");
            
            for (Payslip p : payslips) {
                String accountNumber = p.getUser().getAccountNumber() != null ? p.getUser().getAccountNumber() : "N/A";
                String bankName = p.getUser().getBankName() != null ? p.getUser().getBankName() : "N/A";
                bankFile.append(String.format("%s,%s %s,%s,%.2f,PAYROLL_%s\n",
                    accountNumber,
                    p.getUser().getFirstName(),
                    p.getUser().getLastName(),
                    bankName,
                    p.getNetPay(),
                    run.getId()));
            }

            return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=bank_transfer_" + id + ".csv")
                .header("Content-Type", "text/csv")
                .body(bankFile.toString());
        } catch (Exception e) {
            logger.error("Error generating bank file: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
