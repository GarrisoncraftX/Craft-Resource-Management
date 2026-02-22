package com.craftresourcemanagement.hr;

import com.craftresourcemanagement.asset.repositories.AssetRepository;
import com.craftresourcemanagement.finance.repositories.*;
import com.craftresourcemanagement.asset.repositories.*;
import com.craftresourcemanagement.hr.repositories.*;
import com.craftresourcemanagement.system.repositories.AuditLogRepository;
import com.craftresourcemanagement.system.repositories.NotificationRepository;
import com.craftresourcemanagement.system.repositories.*;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import javax.sql.DataSource;

@TestConfiguration
public class HRTestConfig {

    @MockBean private AssetRepository assetRepository;
    @MockBean private AssetAuditRepository assetAuditRepository;
    @MockBean private AuditLogRepository auditLogRepository;
    @MockBean private NotificationRepository notificationRepository;
    @MockBean private UserRepository userRepository;
    @MockBean private PayrollRunRepository payrollRunRepository;
    @MockBean private PayslipRepository payslipRepository;
    @MockBean private BenefitPlanRepository benefitPlanRepository;
    @MockBean private EmployeeBenefitRepository employeeBenefitRepository;
    @MockBean private TrainingCourseRepository trainingCourseRepository;
    @MockBean private EmployeeTrainingRepository employeeTrainingRepository;
    @MockBean private PerformanceReviewRepository performanceReviewRepository;
    @MockBean private EmployeeOffboardingRepository employeeOffboardingRepository;
    @MockBean private JobGradeRepository jobGradeRepository;
    @MockBean private JobPostingRepository jobPostingRepository;
    @MockBean private OnboardingChecklistRepository onboardingChecklistRepository;
    @MockBean private ChartOfAccountRepository chartOfAccountRepository;
    @MockBean private JournalEntryRepository journalEntryRepository;
    @MockBean private BudgetRepository budgetRepository;
    @MockBean private BudgetRequestRepository budgetRequestRepository;
    @MockBean private AccountPayableRepository accountPayableRepository;
    @MockBean private AccountReceivableRepository accountReceivableRepository;
    @MockBean private InvoiceSequenceRepository invoiceSequenceRepository;
    
    
    // System repositories
    @MockBean private ActiveSessionRepository activeSessionRepository;
    @MockBean private GuardPostRepository guardPostRepository;
    @MockBean private SecurityIncidentRepository securityIncidentRepository;
    @MockBean private SOPRepository sopRepository;
    @MockBean private SupportTicketRepository supportTicketRepository;
    @MockBean private SystemConfigRepository systemConfigRepository;
    
    // DataSource for AdminController
    @MockBean private DataSource dataSource;

    @Bean
    @Primary
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
