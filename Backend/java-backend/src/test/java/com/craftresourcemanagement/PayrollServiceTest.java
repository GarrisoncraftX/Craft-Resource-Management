package com.craftresourcemanagement;

import com.craftresourcemanagement.hr.entities.PayrollRun;
import com.craftresourcemanagement.hr.entities.Payslip;
import com.craftresourcemanagement.hr.entities.User;
import com.craftresourcemanagement.hr.repositories.PayrollRunRepository;
import com.craftresourcemanagement.hr.repositories.PayslipRepository;
import com.craftresourcemanagement.hr.repositories.BenefitPlanRepository;
import com.craftresourcemanagement.hr.repositories.EmployeeBenefitRepository;
import com.craftresourcemanagement.hr.repositories.TrainingCourseRepository;
import com.craftresourcemanagement.hr.repositories.EmployeeTrainingRepository;
import com.craftresourcemanagement.hr.repositories.PerformanceReviewRepository;
import com.craftresourcemanagement.hr.repositories.UserRepository;
import com.craftresourcemanagement.hr.services.impl.PayrollServiceImpl;
import com.craftresourcemanagement.utils.OpenAIClient;
import com.craftresourcemanagement.utils.AuditClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PayrollServiceTest {

    @Mock
    private PayrollRunRepository payrollRunRepository;

    @Mock
    private PayslipRepository payslipRepository;

    @Mock
    private BenefitPlanRepository benefitPlanRepository;

    @Mock
    private EmployeeBenefitRepository employeeBenefitRepository;

    @Mock
    private TrainingCourseRepository trainingCourseRepository;

    @Mock
    private EmployeeTrainingRepository employeeTrainingRepository;

    @Mock
    private PerformanceReviewRepository performanceReviewRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OpenAIClient openAIClient;

    @Mock
    private AuditClient auditClient;

    @Mock
    private com.craftresourcemanagement.hr.services.NotificationService notificationService;

    @Mock
    private com.craftresourcemanagement.hr.services.HRNotificationService hrNotificationService;

    @InjectMocks
    private PayrollServiceImpl payrollService;

    private PayrollRun testPayrollRun;
    private Payslip testPayslip;

    @BeforeEach
    void setUp() {
        testPayrollRun = new PayrollRun();
        testPayrollRun.setRunMonth(6);
        testPayrollRun.setRunYear(2024);
        testPayrollRun.setStatus("PENDING");

        testPayslip = new Payslip();
        User testUser = new User();
        testUser.setId(1L);
        testPayslip.setUser(testUser);
        testPayslip.setGrossPay(new BigDecimal("5000.00"));
        testPayslip.setNetPay(new BigDecimal("4500.00"));
    }





    @Test
    void testGetPayslipsByUser_Success() {
        User testUser = new User();
        testUser.setId(1L);
        List<Payslip> mockPayslips = Arrays.asList(testPayslip);
        when(payslipRepository.findByUserOrderByPayPeriodEndDesc(any(User.class))).thenReturn(mockPayslips);

        List<Payslip> result = payrollService.getPayslipsByUser(testUser);

        assertEquals(1, result.size());
    }




}
