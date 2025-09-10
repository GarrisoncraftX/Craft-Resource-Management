package com.craftresourcemanagement.hr.services.impl;

import com.craftresourcemanagement.hr.entities.*;
import com.craftresourcemanagement.hr.repositories.*;
import com.craftresourcemanagement.hr.services.PayrollService;
import com.craftresourcemanagement.utils.OpenAIClient;
import com.craftresourcemanagement.utils.OpenAIClientException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
public class PayrollServiceImpl implements PayrollService {

    private static final Logger logger = LoggerFactory.getLogger(PayrollServiceImpl.class);

    private final PayrollRunRepository payrollRunRepository;
    private final PayslipRepository payslipRepository;
    private final BenefitPlanRepository benefitPlanRepository;
    private final EmployeeBenefitRepository employeeBenefitRepository;
    private final TrainingCourseRepository trainingCourseRepository;
    private final EmployeeTrainingRepository employeeTrainingRepository;
    private final PerformanceReviewRepository performanceReviewRepository;

    private final OpenAIClient openAIClient;

    @Value("${openai.api.key}")
    private String openAIKey;

    public PayrollServiceImpl(PayrollRunRepository payrollRunRepository,
            PayslipRepository payslipRepository,
            BenefitPlanRepository benefitPlanRepository,
            EmployeeBenefitRepository employeeBenefitRepository,
            TrainingCourseRepository trainingCourseRepository,
            EmployeeTrainingRepository employeeTrainingRepository,
            PerformanceReviewRepository performanceReviewRepository,
            OpenAIClient openAIClient) {
        this.payrollRunRepository = payrollRunRepository;
        this.payslipRepository = payslipRepository;
        this.benefitPlanRepository = benefitPlanRepository;
        this.employeeBenefitRepository = employeeBenefitRepository;
        this.trainingCourseRepository = trainingCourseRepository;
        this.employeeTrainingRepository = employeeTrainingRepository;
        this.performanceReviewRepository = performanceReviewRepository;
        this.openAIClient = openAIClient;
    }

    // PayrollRun
    @Override
    public PayrollRun createPayrollRun(PayrollRun payrollRun) {
        return payrollRunRepository.save(payrollRun);
    }

    @Override
    public List<PayrollRun> getAllPayrollRuns() {
        return payrollRunRepository.findAll();
    }

    @Override
    public PayrollRun getPayrollRunById(Long id) {
        return payrollRunRepository.findById(id).orElse(null);
    }

    @Override
    public PayrollRun updatePayrollRun(Long id, PayrollRun payrollRun) {
        Optional<PayrollRun> existing = payrollRunRepository.findById(id);
        if (existing.isPresent()) {
            PayrollRun toUpdate = existing.get();
            toUpdate.setRunDate(payrollRun.getRunDate());
            toUpdate.setStatus(payrollRun.getStatus());
            return payrollRunRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deletePayrollRun(Long id) {
        payrollRunRepository.deleteById(id);
    }

    // Payslip
    @Override
    public Payslip createPayslip(Payslip payslip) {
        Payslip savedPayslip = payslipRepository.save(payslip);
        // After saving, call NLP analysis AI
        analyzePerformanceReview(savedPayslip);
        return savedPayslip;
    }

    @Override
    public List<Payslip> getAllPayslips() {
        return payslipRepository.findAll();
    }

    @Override
    public Payslip getPayslipById(Long id) {
        return payslipRepository.findById(id).orElse(null);
    }

    @Override
    public Payslip updatePayslip(Long id, Payslip payslip) {
        Optional<Payslip> existing = payslipRepository.findById(id);
        if (existing.isPresent()) {
            Payslip toUpdate = existing.get();
            toUpdate.setPayrollRun(payslip.getPayrollRun());
            toUpdate.setUser(payslip.getUser());
            toUpdate.setPayPeriodStart(payslip.getPayPeriodStart());
            toUpdate.setPayPeriodEnd(payslip.getPayPeriodEnd());
            toUpdate.setGrossPay(payslip.getGrossPay());
            toUpdate.setNetPay(payslip.getNetPay());
            toUpdate.setTaxDeductions(payslip.getTaxDeductions());
            toUpdate.setOtherDeductions(payslip.getOtherDeductions());
            Payslip updatedPayslip = payslipRepository.save(toUpdate);
            // After update, call NLP analysis AI
            analyzePerformanceReview(updatedPayslip);
            return updatedPayslip;
        }
        return null;
    }

    @Override
    public void deletePayslip(Long id) {
        payslipRepository.deleteById(id);
    }

    // BenefitPlan
    @Override
    public BenefitPlan createBenefitPlan(BenefitPlan benefitPlan) {
        return benefitPlanRepository.save(benefitPlan);
    }

    @Override
    public List<BenefitPlan> getAllBenefitPlans() {
        return benefitPlanRepository.findAll();
    }

    @Override
    public BenefitPlan getBenefitPlanById(Long id) {
        return benefitPlanRepository.findById(id).orElse(null);
    }

    @Override
    public BenefitPlan updateBenefitPlan(Long id, BenefitPlan benefitPlan) {
        Optional<BenefitPlan> existing = benefitPlanRepository.findById(id);
        if (existing.isPresent()) {
            BenefitPlan toUpdate = existing.get();
            toUpdate.setPlanName(benefitPlan.getPlanName());
            toUpdate.setContributionAmount(benefitPlan.getContributionAmount());
            toUpdate.setDescription(benefitPlan.getDescription());
            return benefitPlanRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deleteBenefitPlan(Long id) {
        benefitPlanRepository.deleteById(id);
    }

    // EmployeeBenefit
    @Override
    public EmployeeBenefit createEmployeeBenefit(EmployeeBenefit employeeBenefit) {
        return employeeBenefitRepository.save(employeeBenefit);
    }

    @Override
    public List<EmployeeBenefit> getAllEmployeeBenefits() {
        return employeeBenefitRepository.findAll();
    }

    @Override
    public EmployeeBenefit getEmployeeBenefitById(Long id) {
        return employeeBenefitRepository.findById(id).orElse(null);
    }

    @Override
    public EmployeeBenefit updateEmployeeBenefit(Long id, EmployeeBenefit employeeBenefit) {
        Optional<EmployeeBenefit> existing = employeeBenefitRepository.findById(id);
        if (existing.isPresent()) {
            EmployeeBenefit toUpdate = existing.get();
            toUpdate.setUser(employeeBenefit.getUser());
            toUpdate.setBenefitPlan(employeeBenefit.getBenefitPlan());
            toUpdate.setStartDate(employeeBenefit.getStartDate());
            toUpdate.setEndDate(employeeBenefit.getEndDate());
            return employeeBenefitRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deleteEmployeeBenefit(Long id) {
        employeeBenefitRepository.deleteById(id);
    }

    // TrainingCourse
    @Override
    public TrainingCourse createTrainingCourse(TrainingCourse trainingCourse) {
        return trainingCourseRepository.save(trainingCourse);
    }

    @Override
    public List<TrainingCourse> getAllTrainingCourses() {
        return trainingCourseRepository.findAll();
    }

    @Override
    public TrainingCourse getTrainingCourseById(Long id) {
        return trainingCourseRepository.findById(id).orElse(null);
    }

    @Override
    public TrainingCourse updateTrainingCourse(Long id, TrainingCourse trainingCourse) {
        Optional<TrainingCourse> existing = trainingCourseRepository.findById(id);
        if (existing.isPresent()) {
            TrainingCourse toUpdate = existing.get();
            toUpdate.setCourseName(trainingCourse.getCourseName());
            toUpdate.setDescription(trainingCourse.getDescription());
            toUpdate.setStartDate(trainingCourse.getStartDate());
            toUpdate.setEndDate(trainingCourse.getEndDate());
            return trainingCourseRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deleteTrainingCourse(Long id) {
        trainingCourseRepository.deleteById(id);
    }

    // EmployeeTraining
    @Override
    public EmployeeTraining createEmployeeTraining(EmployeeTraining employeeTraining) {
        return employeeTrainingRepository.save(employeeTraining);
    }

    @Override
    public List<EmployeeTraining> getAllEmployeeTrainings() {
        return employeeTrainingRepository.findAll();
    }

    @Override
    public EmployeeTraining getEmployeeTrainingById(Long id) {
        return employeeTrainingRepository.findById(id).orElse(null);
    }

    @Override
    public EmployeeTraining updateEmployeeTraining(Long id, EmployeeTraining employeeTraining) {
        Optional<EmployeeTraining> existing = employeeTrainingRepository.findById(id);
        if (existing.isPresent()) {
            EmployeeTraining toUpdate = existing.get();
            toUpdate.setUser(employeeTraining.getUser());
            toUpdate.setTrainingCourse(employeeTraining.getTrainingCourse());
            toUpdate.setEnrollmentDate(employeeTraining.getEnrollmentDate());
            toUpdate.setCompletionDate(employeeTraining.getCompletionDate());
            return employeeTrainingRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deleteEmployeeTraining(Long id) {
        employeeTrainingRepository.deleteById(id);
    }

    // PerformanceReview
    @Override
    public PerformanceReview createPerformanceReview(PerformanceReview performanceReview) {
        return performanceReviewRepository.save(performanceReview);
    }

    @Override
    public List<PerformanceReview> getAllPerformanceReviews() {
        return performanceReviewRepository.findAll();
    }

    @Override
    public PerformanceReview getPerformanceReviewById(Long id) {
        return performanceReviewRepository.findById(id).orElse(null);
    }

    @Override
    public PerformanceReview updatePerformanceReview(Long id, PerformanceReview performanceReview) {
        Optional<PerformanceReview> existing = performanceReviewRepository.findById(id);
        if (existing.isPresent()) {
            PerformanceReview toUpdate = existing.get();
            toUpdate.setUser(performanceReview.getUser());
            toUpdate.setReviewDate(performanceReview.getReviewDate());
            toUpdate.setReviewText(performanceReview.getReviewText());
            toUpdate.setReviewer(performanceReview.getReviewer());
            return performanceReviewRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deletePerformanceReview(Long id) {
        performanceReviewRepository.deleteById(id);
    }

    private void analyzePerformanceReview(Payslip payslip) {
        // Prepare prompt for NLP analysis
        String prompt = "Analyze the provided performance review text. Determine the overall sentiment (e.g., 'Positive', 'Neutral', 'Needs Improvement'), identify recurring themes, and pinpoint specific strengths and areas for development. Provide a concise summary of the analysis. If actionable insights or areas for growth are identified, present them in a supportive and constructive manner. Prioritize clarity, conciseness, and a humane tone in your response: "
                + payslip.toString();
        try {
            String response = openAIClient.callOpenAIAPI(openAIKey, prompt);
            logger.info("NLP analysis result: {}", response);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new OpenAIClientException("Payroll processing interrupted unexpectedly.", e);
            
        } catch (Exception e) {
            logger.error("Error during payroll processing: {}", e.getMessage());
        }

    }
}
