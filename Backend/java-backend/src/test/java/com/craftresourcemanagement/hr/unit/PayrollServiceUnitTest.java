package com.craftresourcemanagement.hr.unit;

import com.craftresourcemanagement.hr.entities.*;
import com.craftresourcemanagement.hr.repositories.*;
import com.craftresourcemanagement.hr.services.HRNotificationService;
import com.craftresourcemanagement.hr.services.NotificationService;
import com.craftresourcemanagement.hr.services.impl.PayrollServiceImpl;
import com.craftresourcemanagement.utils.AuditClient;
import com.craftresourcemanagement.utils.OpenAIClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PayrollServiceUnitTest {

    @Mock private PayrollRunRepository payrollRunRepository;
    @Mock private PayslipRepository payslipRepository;
    @Mock private BenefitPlanRepository benefitPlanRepository;
    @Mock private EmployeeBenefitRepository employeeBenefitRepository;
    @Mock private TrainingCourseRepository trainingCourseRepository;
    @Mock private EmployeeTrainingRepository employeeTrainingRepository;
    @Mock private PerformanceReviewRepository performanceReviewRepository;
    @Mock private UserRepository userRepository;
    @Mock private OpenAIClient openAIClient;
    @Mock private AuditClient auditClient;
    @Mock private NotificationService notificationService;
    @Mock private HRNotificationService hrNotificationService;

    @InjectMocks
    private PayrollServiceImpl payrollService;

    private PayrollRun testPayrollRun;
    private Payslip testPayslip;
    private User testUser;
    private BenefitPlan testBenefitPlan;
    private TrainingCourse testCourse;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setSalary(5000.0);

        testPayrollRun = new PayrollRun();
        testPayrollRun.setStatus("PENDING");

        testPayslip = new Payslip();
        testPayslip.setUser(testUser);
        testPayslip.setGrossPay(new BigDecimal("5000.00"));
        testPayslip.setNetPay(new BigDecimal("4500.00"));

        testBenefitPlan = new BenefitPlan();
        testBenefitPlan.setPlanName("Health Insurance");

        testCourse = new TrainingCourse();
        testCourse.setCourseName("Java Training");
    }

    @Test
    void createPayrollRun_Success() {
        when(payrollRunRepository.save(any(PayrollRun.class))).thenReturn(testPayrollRun);
        PayrollRun result = payrollService.createPayrollRun(testPayrollRun);
        assertNotNull(result);
        verify(payrollRunRepository).save(any(PayrollRun.class));
    }

    @Test
    void getAllPayrollRuns_Success() {
        when(payrollRunRepository.findAll()).thenReturn(Arrays.asList(testPayrollRun));
        List<PayrollRun> result = payrollService.getAllPayrollRuns();
        assertEquals(1, result.size());
    }

    @Test
    void getPayrollRunById_Found() {
        when(payrollRunRepository.findById(1L)).thenReturn(Optional.of(testPayrollRun));
        PayrollRun result = payrollService.getPayrollRunById(1L);
        assertNotNull(result);
    }

    @Test
    void getPayrollRunById_NotFound() {
        when(payrollRunRepository.findById(999L)).thenReturn(Optional.empty());
        PayrollRun result = payrollService.getPayrollRunById(999L);
        assertNull(result);
    }

    @Test
    void updatePayrollRun_Success() {
        when(payrollRunRepository.findById(1L)).thenReturn(Optional.of(testPayrollRun));
        when(payrollRunRepository.save(any(PayrollRun.class))).thenReturn(testPayrollRun);
        PayrollRun result = payrollService.updatePayrollRun(1L, testPayrollRun);
        assertNotNull(result);
    }

    @Test
    void deletePayrollRun_Success() {
        doNothing().when(payrollRunRepository).deleteById(1L);
        payrollService.deletePayrollRun(1L);
        verify(payrollRunRepository).deleteById(1L);
    }

    @Test
    void createPayslip_Success() {
        when(payslipRepository.save(any(Payslip.class))).thenReturn(testPayslip);
        Payslip result = payrollService.createPayslip(testPayslip);
        assertNotNull(result);
    }

    @Test
    void getAllPayslips_Success() {
        when(payslipRepository.findAll()).thenReturn(Arrays.asList(testPayslip));
        List<Payslip> result = payrollService.getAllPayslips();
        assertEquals(1, result.size());
    }

    @Test
    void getPayslipById_Found() {
        when(payslipRepository.findById(1L)).thenReturn(Optional.of(testPayslip));
        Payslip result = payrollService.getPayslipById(1L);
        assertNotNull(result);
    }

    @Test
    void updatePayslip_Success() {
        when(payslipRepository.findById(1L)).thenReturn(Optional.of(testPayslip));
        when(payslipRepository.save(any(Payslip.class))).thenReturn(testPayslip);
        Payslip result = payrollService.updatePayslip(1L, testPayslip);
        assertNotNull(result);
    }

    @Test
    void deletePayslip_Success() {
        doNothing().when(payslipRepository).deleteById(1L);
        payrollService.deletePayslip(1L);
        verify(payslipRepository).deleteById(1L);
    }

    @Test
    void createBenefitPlan_Success() {
        BenefitPlan savedPlan = new BenefitPlan();
        savedPlan.setPlanName("Health Insurance");
        // Mock will return a plan with ID set by JPA
        when(benefitPlanRepository.save(any(BenefitPlan.class))).thenAnswer(invocation -> {
            BenefitPlan plan = invocation.getArgument(0);
            // Simulate JPA setting the ID
            try {
                java.lang.reflect.Field idField = BenefitPlan.class.getDeclaredField("id");
                idField.setAccessible(true);
                idField.set(plan, 1L);
            } catch (Exception e) {
                // Ignore reflection errors in test
            }
            return plan;
        });
        BenefitPlan result = payrollService.createBenefitPlan(testBenefitPlan);
        assertNotNull(result);
    }

    @Test
    void getAllBenefitPlans_Success() {
        when(benefitPlanRepository.findAll()).thenReturn(Arrays.asList(testBenefitPlan));
        List<BenefitPlan> result = payrollService.getAllBenefitPlans();
        assertEquals(1, result.size());
    }

    @Test
    void getBenefitPlanById_Found() {
        when(benefitPlanRepository.findById(1L)).thenReturn(Optional.of(testBenefitPlan));
        BenefitPlan result = payrollService.getBenefitPlanById(1L);
        assertNotNull(result);
    }

    @Test
    void updateBenefitPlan_Success() {
        when(benefitPlanRepository.findById(1L)).thenReturn(Optional.of(testBenefitPlan));
        when(benefitPlanRepository.save(any(BenefitPlan.class))).thenReturn(testBenefitPlan);
        BenefitPlan result = payrollService.updateBenefitPlan(1L, testBenefitPlan);
        assertNotNull(result);
    }

    @Test
    void deleteBenefitPlan_Success() {
        doNothing().when(benefitPlanRepository).deleteById(1L);
        payrollService.deleteBenefitPlan(1L);
        verify(benefitPlanRepository).deleteById(1L);
    }

    @Test
    void createTrainingCourse_Success() {
        when(trainingCourseRepository.save(any(TrainingCourse.class))).thenAnswer(invocation -> {
            TrainingCourse course = invocation.getArgument(0);
            try {
                java.lang.reflect.Field idField = TrainingCourse.class.getDeclaredField("id");
                idField.setAccessible(true);
                idField.set(course, 1L);
            } catch (Exception e) {
                // Ignore reflection errors in test
            }
            return course;
        });
        TrainingCourse result = payrollService.createTrainingCourse(testCourse);
        assertNotNull(result);
    }

    @Test
    void getAllTrainingCourses_Success() {
        when(trainingCourseRepository.findAll()).thenReturn(Arrays.asList(testCourse));
        List<TrainingCourse> result = payrollService.getAllTrainingCourses();
        assertEquals(1, result.size());
    }

    @Test
    void getTrainingCourseById_Found() {
        when(trainingCourseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        TrainingCourse result = payrollService.getTrainingCourseById(1L);
        assertNotNull(result);
    }

    @Test
    void createEmployeeBenefit_Success() {
        EmployeeBenefit eb = new EmployeeBenefit();
        eb.setUser(testUser);
        when(employeeBenefitRepository.save(any(EmployeeBenefit.class))).thenAnswer(invocation -> {
            EmployeeBenefit benefit = invocation.getArgument(0);
            try {
                java.lang.reflect.Field idField = EmployeeBenefit.class.getDeclaredField("id");
                idField.setAccessible(true);
                idField.set(benefit, 1L);
            } catch (Exception e) {
                // Ignore reflection errors in test
            }
            return benefit;
        });
        EmployeeBenefit result = payrollService.createEmployeeBenefit(eb);
        assertNotNull(result);
    }

    @Test
    void createEmployeeTraining_Success() {
        EmployeeTraining et = new EmployeeTraining();
        et.setUser(testUser);
        when(employeeTrainingRepository.save(any(EmployeeTraining.class))).thenAnswer(invocation -> {
            EmployeeTraining training = invocation.getArgument(0);
            try {
                java.lang.reflect.Field idField = EmployeeTraining.class.getDeclaredField("id");
                idField.setAccessible(true);
                idField.set(training, 1L);
            } catch (Exception e) {
                // Ignore reflection errors in test
            }
            return training;
        });
        EmployeeTraining result = payrollService.createEmployeeTraining(et);
        assertNotNull(result);
    }

    @Test
    void createPerformanceReview_Success() {
        PerformanceReview pr = new PerformanceReview();
        when(performanceReviewRepository.save(any(PerformanceReview.class))).thenReturn(pr);
        PerformanceReview result = payrollService.createPerformanceReview(pr);
        assertNotNull(result);
    }

    @Test
    void getPayslipsByUser_Success() {
        when(payslipRepository.findByUserOrderByPayPeriodEndDesc(any(User.class))).thenReturn(Arrays.asList(testPayslip));
        List<Payslip> result = payrollService.getPayslipsByUser(testUser);
        assertEquals(1, result.size());
    }

    @Test
    void processPayroll_Success() {
        lenient().when(userRepository.findAll()).thenReturn(Arrays.asList(testUser));
        lenient().when(payrollRunRepository.save(any(PayrollRun.class))).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(payslipRepository.save(any(Payslip.class))).thenAnswer(invocation -> invocation.getArgument(0));
        
        PayrollRun result = payrollService.processPayroll(
            LocalDate.now().minusDays(30), LocalDate.now(), LocalDate.now().plusDays(5),
            null, true, true, true, 1L
        );
        
        assertNotNull(result);
    }
}
