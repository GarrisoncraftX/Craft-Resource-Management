package com.craftresourcemanagement.hr.controllers;

import com.craftresourcemanagement.hr.entities.*;
import com.craftresourcemanagement.hr.services.PayrollService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hr/payroll")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
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
        return ResponseEntity.ok(payrollService.getAllPayslips());
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
}
