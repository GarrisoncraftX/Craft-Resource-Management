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
import java.util.Map;
import java.util.Optional;

@Service
public class PayrollServiceImpl implements PayrollService {

    private static final Logger logger = LoggerFactory.getLogger(PayrollServiceImpl.class);
    private static final String SERVICE_NAME = "java-backend";

    private final PayrollRunRepository payrollRunRepository;
    private final PayslipRepository payslipRepository;
    private final BenefitPlanRepository benefitPlanRepository;
    private final EmployeeBenefitRepository employeeBenefitRepository;
    private final TrainingCourseRepository trainingCourseRepository;
    private final EmployeeTrainingRepository employeeTrainingRepository;
    private final PerformanceReviewRepository performanceReviewRepository;
    private final UserRepository userRepository;
    private final JobGradeRepository jobGradeRepository;

    private final OpenAIClient openAIClient;
    private final AuditClient auditClient;
    private final com.craftresourcemanagement.hr.services.NotificationService notificationService;
    private final com.craftresourcemanagement.hr.services.HRNotificationService hrNotificationService;
    private final com.craftresourcemanagement.hr.services.AttendanceIntegrationService attendanceIntegrationService;
    private final com.craftresourcemanagement.hr.services.LeaveIntegrationService leaveIntegrationService;

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
            JobGradeRepository jobGradeRepository,
            OpenAIClient openAIClient,
            AuditClient auditClient,
            com.craftresourcemanagement.hr.services.NotificationService notificationService,
            com.craftresourcemanagement.hr.services.HRNotificationService hrNotificationService,
            com.craftresourcemanagement.hr.services.AttendanceIntegrationService attendanceIntegrationService,
            com.craftresourcemanagement.hr.services.LeaveIntegrationService leaveIntegrationService) {
        this.payrollRunRepository = payrollRunRepository;
        this.payslipRepository = payslipRepository;
        this.benefitPlanRepository = benefitPlanRepository;
        this.employeeBenefitRepository = employeeBenefitRepository;
        this.trainingCourseRepository = trainingCourseRepository;
        this.employeeTrainingRepository = employeeTrainingRepository;
        this.performanceReviewRepository = performanceReviewRepository;
        this.userRepository = userRepository;
        this.jobGradeRepository = jobGradeRepository;
        this.openAIClient = openAIClient;
        this.auditClient = auditClient;
        this.notificationService = notificationService;
        this.hrNotificationService = hrNotificationService;
        this.attendanceIntegrationService = attendanceIntegrationService;
        this.leaveIntegrationService = leaveIntegrationService;
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
            PayrollRun updated = payrollRunRepository.save(toUpdate);
            auditClient.logActionAsync(null, "updated payroll run", 
                String.format("{\"module\":\"payroll\",\"operation\":\"UPDATE\",\"runId\":%d}", id),
                SERVICE_NAME, "PAYROLL_RUN", id.toString());
            return updated;
        }
        return null;
    }

    @Override
    public void deletePayrollRun(Long id) {
        payrollRunRepository.deleteById(id);
        auditClient.logActionAsync(null, "deleted payroll run", 
            String.format("{\"module\":\"payroll\",\"operation\":\"DELETE\",\"runId\":%d}", id),
            SERVICE_NAME, "PAYROLL_RUN", id.toString());
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
            Payslip updated = payslipRepository.save(toUpdate);
            auditClient.logActionAsync(toUpdate.getUser().getId(), "updated payslip", 
                String.format("{\"module\":\"payroll\",\"operation\":\"UPDATE\",\"payslipId\":%d}", id),
                SERVICE_NAME, "PAYSLIP", id.toString());
            return updated;
        }
        return null;
    }

    @Override
    public void deletePayslip(Long id) {
        payslipRepository.findById(id).ifPresent(p -> 
            auditClient.logActionAsync(p.getUser().getId(), "deleted payslip", 
                String.format("{\"module\":\"payroll\",\"operation\":\"DELETE\",\"payslipId\":%d}", id),
                SERVICE_NAME, "PAYSLIP", id.toString()));
        payslipRepository.deleteById(id);
    }

    // BenefitPlan
    @Override
    public BenefitPlan createBenefitPlan(BenefitPlan benefitPlan) {
        BenefitPlan saved = benefitPlanRepository.save(benefitPlan);
        auditClient.logActionAsync(null, "created benefit plan", 
            String.format("{\"module\":\"benefits\",\"operation\":\"CREATE\",\"planName\":\"%s\"}", saved.getPlanName()),
            SERVICE_NAME, "BENEFIT_PLAN", saved.getId().toString());
        return saved;
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
            BenefitPlan updated = benefitPlanRepository.save(toUpdate);
            auditClient.logActionAsync(null, "updated benefit plan", 
                String.format("{\"module\":\"benefits\",\"operation\":\"UPDATE\",\"planId\":%d}", id),
                SERVICE_NAME, "BENEFIT_PLAN", id.toString());
            return updated;
        }
        return null;
    }

    @Override
    public void deleteBenefitPlan(Long id) {
        benefitPlanRepository.deleteById(id);
        auditClient.logActionAsync(null, "deleted benefit plan", 
            String.format("{\"module\":\"benefits\",\"operation\":\"DELETE\",\"planId\":%d}", id),
            SERVICE_NAME, "BENEFIT_PLAN", id.toString());
    }

    // EmployeeBenefit
    @Override
    public EmployeeBenefit createEmployeeBenefit(EmployeeBenefit employeeBenefit) {
        EmployeeBenefit saved = employeeBenefitRepository.save(employeeBenefit);
        auditClient.logActionAsync(saved.getUser().getId(), "enrolled in benefit plan", 
            String.format("{\"module\":\"benefits\",\"operation\":\"CREATE\",\"benefitId\":%d}", saved.getId()),
            SERVICE_NAME, "EMPLOYEE_BENEFIT", saved.getId().toString());
        return saved;
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
            EmployeeBenefit updated = employeeBenefitRepository.save(toUpdate);
            auditClient.logActionAsync(updated.getUser().getId(), "updated benefit enrollment", 
                String.format("{\"module\":\"benefits\",\"operation\":\"UPDATE\",\"benefitId\":%d}", id),
                SERVICE_NAME, "EMPLOYEE_BENEFIT", id.toString());
            return updated;
        }
        return null;
    }

    @Override
    public void deleteEmployeeBenefit(Long id) {
        employeeBenefitRepository.findById(id).ifPresent(eb -> 
            auditClient.logActionAsync(eb.getUser().getId(), "removed from benefit plan", 
                String.format("{\"module\":\"benefits\",\"operation\":\"DELETE\",\"benefitId\":%d}", id),
                SERVICE_NAME, "EMPLOYEE_BENEFIT", id.toString()));
        employeeBenefitRepository.deleteById(id);
    }

    // TrainingCourse
    @Override
    public TrainingCourse createTrainingCourse(TrainingCourse trainingCourse) {
        TrainingCourse saved = trainingCourseRepository.save(trainingCourse);
        auditClient.logActionAsync(null, "created training course", 
            String.format("{\"module\":\"training\",\"operation\":\"CREATE\",\"courseName\":\"%s\"}", saved.getCourseName()),
            SERVICE_NAME, "TRAINING_COURSE", saved.getId().toString());
        return saved;
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
            TrainingCourse updated = trainingCourseRepository.save(toUpdate);
            auditClient.logActionAsync(null, "updated training course", 
                String.format("{\"module\":\"training\",\"operation\":\"UPDATE\",\"courseId\":%d}", id),
                SERVICE_NAME, "TRAINING_COURSE", id.toString());
            return updated;
        }
        return null;
    }

    @Override
    public void deleteTrainingCourse(Long id) {
        trainingCourseRepository.deleteById(id);
        auditClient.logActionAsync(null, "deleted training course", 
            String.format("{\"module\":\"training\",\"operation\":\"DELETE\",\"courseId\":%d}", id),
            SERVICE_NAME, "TRAINING_COURSE", id.toString());
    }

    // EmployeeTraining
    @Override
    public EmployeeTraining createEmployeeTraining(EmployeeTraining employeeTraining) {
        EmployeeTraining saved = employeeTrainingRepository.save(employeeTraining);
        auditClient.logActionAsync(saved.getUser().getId(), "enrolled in training course", 
            String.format("{\"module\":\"training\",\"operation\":\"CREATE\",\"trainingId\":%d}", saved.getId()),
            SERVICE_NAME, "EMPLOYEE_TRAINING", saved.getId().toString());
        return saved;
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
            EmployeeTraining updated = employeeTrainingRepository.save(toUpdate);
            auditClient.logActionAsync(updated.getUser().getId(), "updated training enrollment", 
                String.format("{\"module\":\"training\",\"operation\":\"UPDATE\",\"trainingId\":%d}", id),
                SERVICE_NAME, "EMPLOYEE_TRAINING", id.toString());
            return updated;
        }
        return null;
    }

    @Override
    public void deleteEmployeeTraining(Long id) {
        employeeTrainingRepository.findById(id).ifPresent(et -> 
            auditClient.logActionAsync(et.getUser().getId(), "removed from training course", 
                String.format("{\"module\":\"training\",\"operation\":\"DELETE\",\"trainingId\":%d}", id),
                SERVICE_NAME, "EMPLOYEE_TRAINING", id.toString()));
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
            PerformanceReview updated = performanceReviewRepository.save(toUpdate);
            auditClient.logActionAsync(updated.getEmployeeId(), "updated performance review", 
                String.format("{\"module\":\"performance\",\"operation\":\"UPDATE\",\"reviewId\":%d}", id),
                SERVICE_NAME, "PERFORMANCE_REVIEW", id.toString());
            return updated;
        }
        return null;
    }

    @Override
    public void deletePerformanceReview(Long id) {
        performanceReviewRepository.findById(id).ifPresent(pr -> 
            auditClient.logActionAsync(pr.getEmployeeId(), "deleted performance review", 
                String.format("{\"module\":\"performance\",\"operation\":\"DELETE\",\"reviewId\":%d}", id),
                SERVICE_NAME, "PERFORMANCE_REVIEW", id.toString()));
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
                .filter(u -> (u.getIsActive() == 1 || "ACTIVE".equals(u.getAccountStatus())) 
                    && u.getDepartmentId() != null && u.getDepartmentId().equals(departmentId))
                .toList();
        } else {
            employees = userRepository.findAll().stream()
                .filter(u -> (u.getIsActive() == 1 || "ACTIVE".equals(u.getAccountStatus())))
                .toList();
        }

        List<Payslip> processedPayslips = new java.util.ArrayList<>();
        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalDeductions = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;

        for (User employee : employees) {
            Double salary = employee.getSalary();
            
            // Auto-set salary from job_grade_id if salary is null or 0
            if ((salary == null || salary <= 0) && employee.getJobGradeId() != null) {
                jobGradeRepository.findById(employee.getJobGradeId()).ifPresent(jobGrade -> {
                    employee.setSalary(jobGrade.getBaseSalary().doubleValue());
                    userRepository.save(employee);
                });
                salary = employee.getSalary();
            }
            
            // Skip if still no salary
            if (salary == null || salary <= 0) {
                continue;
            }

            BigDecimal baseSalary = BigDecimal.valueOf(salary);
            
            // Fetch attendance data for overtime calculation
            BigDecimal overtimePay = BigDecimal.ZERO;
            if (includeOvertime) {
                try {
                    List<Map<String, Object>> attendanceRecords = attendanceIntegrationService
                        .getUserAttendanceByDateRange(employee.getId(), startDate.toString(), endDate.toString());
                    double totalOvertimeHours = attendanceRecords.stream()
                        .mapToDouble(rec -> {
                            Object overtimeHoursObj = rec.get("overtime_hours");
                            return overtimeHoursObj != null ? Double.parseDouble(overtimeHoursObj.toString()) : 0.0;
                        })
                        .sum();
                    double hourlyRate = salary / 160;
                    overtimePay = BigDecimal.valueOf(totalOvertimeHours * hourlyRate * 1.5);
                } catch (Exception e) {
                    logger.warn("Failed to fetch attendance for employee {}: {}", employee.getId(), e.getMessage());
                    overtimePay = baseSalary.multiply(BigDecimal.valueOf(0.15));
                }
            }
            
            // Check for unpaid leave deductions
            BigDecimal leaveDeduction = BigDecimal.ZERO;
            try {
                List<Map<String, Object>> approvedLeaves = leaveIntegrationService
                    .getUserLeaveRequests(employee.getId(), "approved");
                long unpaidLeaveDays = approvedLeaves.stream()
                    .filter(lv -> {
                        Object isPaidObj = lv.get("isPaid");
                        return isPaidObj != null && !Boolean.parseBoolean(isPaidObj.toString());
                    })
                    .mapToLong(lv -> {
                        Object totalDaysObj = lv.get("totalDays");
                        return totalDaysObj != null ? Long.parseLong(totalDaysObj.toString()) : 0L;
                    })
                    .sum();
                if (unpaidLeaveDays > 0) {
                    double dailyRate = salary / 22;
                    leaveDeduction = BigDecimal.valueOf(unpaidLeaveDays * dailyRate);
                }
            } catch (Exception e) {
                logger.warn("Failed to fetch leave data for employee {}: {}", employee.getId(), e.getMessage());
            }
            
            BigDecimal bonusPay = includeBonuses ? baseSalary.multiply(BigDecimal.valueOf(0.10)) : BigDecimal.ZERO;
            BigDecimal grossPay = baseSalary.add(overtimePay).add(bonusPay).subtract(leaveDeduction);
            
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
