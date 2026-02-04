package com.craftresourcemanagement.hr.services.impl;

import com.craftresourcemanagement.hr.entities.*;
import com.craftresourcemanagement.hr.repositories.*;
import com.craftresourcemanagement.hr.services.PayrollService;
import com.craftresourcemanagement.utils.AuditClient;
import com.craftresourcemanagement.utils.OpenAIClient;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    private final UserRepository userRepository;

    private final OpenAIClient openAIClient;
    private final AuditClient auditClient;
    private final com.craftresourcemanagement.hr.services.NotificationService notificationService;
    private final com.craftresourcemanagement.hr.services.HRNotificationService hrNotificationService;

    @Value("${openai.api.key}")
    private String openAIKey;

    public PayrollServiceImpl(PayrollRunRepository payrollRunRepository,
            PayslipRepository payslipRepository,
            BenefitPlanRepository benefitPlanRepository,
            EmployeeBenefitRepository employeeBenefitRepository,
            TrainingCourseRepository trainingCourseRepository,
            EmployeeTrainingRepository employeeTrainingRepository,
            PerformanceReviewRepository performanceReviewRepository,
            UserRepository userRepository,
            OpenAIClient openAIClient,
            AuditClient auditClient,
            com.craftresourcemanagement.hr.services.NotificationService notificationService,
            com.craftresourcemanagement.hr.services.HRNotificationService hrNotificationService) {
        this.payrollRunRepository = payrollRunRepository;
        this.payslipRepository = payslipRepository;
        this.benefitPlanRepository = benefitPlanRepository;
        this.employeeBenefitRepository = employeeBenefitRepository;
        this.trainingCourseRepository = trainingCourseRepository;
        this.employeeTrainingRepository = employeeTrainingRepository;
        this.performanceReviewRepository = performanceReviewRepository;
        this.userRepository = userRepository;
        this.openAIClient = openAIClient;
        this.auditClient = auditClient;
        this.notificationService = notificationService;
        this.hrNotificationService = hrNotificationService;
    }

    // PayrollRun
    @Override
    public PayrollRun createPayrollRun(PayrollRun payrollRun) {
        PayrollRun saved = payrollRunRepository.save(payrollRun);
        auditClient.logAction(null, "CREATE_PAYROLL_RUN", String.format("{\"runDate\": \"%s\"}", saved.getRunDate()));
        return saved;
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
        Payslip saved = payslipRepository.save(payslip);
        auditClient.logAction(payslip.getUser().getId(), "CREATE_PAYSLIP", 
            String.format("{\"periodStart\": \"%s\", \"periodEnd\": \"%s\"}", 
                saved.getPayPeriodStart(), saved.getPayPeriodEnd()));
        return saved;
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
            return payslipRepository.save(toUpdate);
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
        PerformanceReview saved = performanceReviewRepository.save(performanceReview);
        auditClient.logAction(null, "CREATE_PERFORMANCE_REVIEW", 
            String.format("{\"employeeId\": %d}", saved.getEmployeeId()));
        analyzePerformanceReview(saved);
        return saved;
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
            toUpdate.setEmployeeId(performanceReview.getEmployeeId());
            toUpdate.setReviewDate(performanceReview.getReviewDate());
            toUpdate.setComments(performanceReview.getComments());
            toUpdate.setReviewerId(performanceReview.getReviewerId());
            toUpdate.setRating(performanceReview.getRating());
            toUpdate.setGoals(performanceReview.getGoals());
            return performanceReviewRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deletePerformanceReview(Long id) {
        performanceReviewRepository.deleteById(id);
    }

    @Override
    public List<Payslip> getPayslipsByUser(User user) {
        return payslipRepository.findByUserOrderByPayPeriodEndDesc(user);
    }

    private void analyzePerformanceReview(PerformanceReview review) {
        if (review == null || review.getComments() == null || review.getComments().isEmpty()) {
            return;
        }
        // Prepare prompt for NLP analysis
        String prompt = "Analyze the provided performance review text. Determine the overall sentiment (e.g., 'Positive', 'Neutral', 'Needs Improvement'), identify recurring themes, and pinpoint specific strengths and areas for development. Provide a concise summary of the analysis. If actionable insights or areas for growth are identified, present them in a supportive and constructive manner. Prioritize clarity, conciseness, and a humane tone in your response: "
                + review.getComments();
        try {
            String response = openAIClient.callOpenAIAPI(openAIKey, prompt);
            logger.info("NLP analysis result: {}", response);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.error("Performance review analysis interrupted: {}", e.getMessage());

        } catch (Exception e) {
            logger.error("Error during performance review analysis: {}", e.getMessage());
        }

    }

    @Override
    @Transactional
    public PayrollRun processPayroll(LocalDate startDate, LocalDate endDate, LocalDate payDate,
                                     Integer departmentId, boolean includeOvertime, 
                                     boolean includeBonuses, boolean includeDeductions, Long createdBy) {
        PayrollRun payrollRun = new PayrollRun();
        payrollRun.setRunMonth(endDate.getMonthValue());
        payrollRun.setRunYear(endDate.getYear());
        payrollRun.setStartDate(startDate);
        payrollRun.setEndDate(endDate);
        payrollRun.setRunDate(payDate.atTime(23, 59, 59));
        payrollRun.setStatus("COMPLETED");
        payrollRun.setCreatedBy(createdBy);

        List<User> employees;
        if (departmentId != null && departmentId > 0) {
            employees = userRepository.findAll().stream()
                .filter(u -> u.getIsActive() == 1 && u.getDepartmentId().equals(departmentId))
                .toList();
        } else {
            employees = userRepository.findByAccountStatus("ACTIVE");
        }

        List<Payslip> processedPayslips = new java.util.ArrayList<>();
        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalDeductions = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;

        for (User employee : employees) {
            if (employee.getSalary() == null || employee.getSalary() <= 0) {
                continue;
            }

            BigDecimal baseSalary = BigDecimal.valueOf(employee.getSalary());
            BigDecimal overtimePay = includeOvertime ? baseSalary.multiply(BigDecimal.valueOf(0.15)) : BigDecimal.ZERO;
            BigDecimal bonusPay = includeBonuses ? baseSalary.multiply(BigDecimal.valueOf(0.10)) : BigDecimal.ZERO;
            BigDecimal grossPay = baseSalary.add(overtimePay).add(bonusPay);
            
            BigDecimal taxDeduction = grossPay.multiply(BigDecimal.valueOf(0.065));
            BigDecimal otherDeduction = BigDecimal.valueOf(350);
            BigDecimal deductions = includeDeductions ? taxDeduction.add(otherDeduction) : BigDecimal.ZERO;
            BigDecimal netPay = grossPay.subtract(deductions);

            totalGross = totalGross.add(grossPay);
            totalDeductions = totalDeductions.add(deductions);
            totalNet = totalNet.add(netPay);

            Payslip payslip = new Payslip();
            payslip.setUser(employee);
            payslip.setPayPeriodStart(startDate);
            payslip.setPayPeriodEnd(endDate);
            payslip.setGrossPay(grossPay);
            payslip.setTaxDeductions(taxDeduction);
            payslip.setOtherDeductions(otherDeduction);
            payslip.setNetPay(netPay);
            processedPayslips.add(payslip);
        }

        payrollRun.setTotalGross(totalGross);
        payrollRun.setTotalDeductions(totalDeductions);
        payrollRun.setTotalNet(totalNet);
        PayrollRun savedRun = payrollRunRepository.save(payrollRun);

        for (Payslip payslip : processedPayslips) {
            payslip.setPayrollRun(savedRun);
            Payslip savedPayslip = payslipRepository.save(payslip);
            
            // Send notification to employee
            try {
                hrNotificationService.notifyPayrollProcessed(
                    savedPayslip.getUser().getId(),
                    savedPayslip.getUser().getFirstName() + " " + savedPayslip.getUser().getLastName(),
                    savedPayslip.getNetPay().doubleValue(),
                    savedPayslip.getPayPeriodStart().toString(),
                    savedPayslip.getPayPeriodEnd().toString()
                );
            } catch (Exception e) {
                logger.error("Failed to send notification to employee {}: {}", 
                    savedPayslip.getUser().getId(), e.getMessage());
            }
        }

        try {
            notificationService.sendBulkPayrollNotifications(processedPayslips);
        } catch (Exception e) {
            logger.error("Failed to send notifications: {}", e.getMessage());
        }

        auditClient.logAction(createdBy, 
                             "PROCESS_PAYROLL", 
                             String.format("{\"employeeCount\": %d, \"startDate\": \"%s\", \"endDate\": \"%s\", \"totalGross\": %.2f, \"totalNet\": %.2f}", 
                                 employees.size(), startDate, endDate, totalGross, totalNet));

        return savedRun;
    }
}
