package com.craftresourcemanagement.hr.services;

import com.craftresourcemanagement.hr.entities.*;

import java.util.List;

public interface PayrollService {

    // PayrollRun
    PayrollRun createPayrollRun(PayrollRun payrollRun);
    List<PayrollRun> getAllPayrollRuns();
    PayrollRun getPayrollRunById(Long id);
    PayrollRun updatePayrollRun(Long id, PayrollRun payrollRun);
    void deletePayrollRun(Long id);

    // Payslip
    Payslip createPayslip(Payslip payslip);
    List<Payslip> getAllPayslips();
    Payslip getPayslipById(Long id);
    Payslip updatePayslip(Long id, Payslip payslip);
    void deletePayslip(Long id);

    // BenefitPlan
    BenefitPlan createBenefitPlan(BenefitPlan benefitPlan);
    List<BenefitPlan> getAllBenefitPlans();
    BenefitPlan getBenefitPlanById(Long id);
    BenefitPlan updateBenefitPlan(Long id, BenefitPlan benefitPlan);
    void deleteBenefitPlan(Long id);

    // EmployeeBenefit
    EmployeeBenefit createEmployeeBenefit(EmployeeBenefit employeeBenefit);
    List<EmployeeBenefit> getAllEmployeeBenefits();
    EmployeeBenefit getEmployeeBenefitById(Long id);
    EmployeeBenefit updateEmployeeBenefit(Long id, EmployeeBenefit employeeBenefit);
    void deleteEmployeeBenefit(Long id);

    // TrainingCourse
    TrainingCourse createTrainingCourse(TrainingCourse trainingCourse);
    List<TrainingCourse> getAllTrainingCourses();
    TrainingCourse getTrainingCourseById(Long id);
    TrainingCourse updateTrainingCourse(Long id, TrainingCourse trainingCourse);
    void deleteTrainingCourse(Long id);

    // EmployeeTraining
    EmployeeTraining createEmployeeTraining(EmployeeTraining employeeTraining);
    List<EmployeeTraining> getAllEmployeeTrainings();
    EmployeeTraining getEmployeeTrainingById(Long id);
    EmployeeTraining updateEmployeeTraining(Long id, EmployeeTraining employeeTraining);
    void deleteEmployeeTraining(Long id);

    // PerformanceReview
    PerformanceReview createPerformanceReview(PerformanceReview performanceReview);
    List<PerformanceReview> getAllPerformanceReviews();
    PerformanceReview getPerformanceReviewById(Long id);
    PerformanceReview updatePerformanceReview(Long id, PerformanceReview performanceReview);
    void deletePerformanceReview(Long id);

    // Payslip by user
    List<Payslip> getPayslipsByUser(User user);
}
