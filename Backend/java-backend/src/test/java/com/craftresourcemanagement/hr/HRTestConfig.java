package com.craftresourcemanagement.hr;

import com.craftresourcemanagement.asset.repositories.AssetRepository;
import com.craftresourcemanagement.asset.repositories.DisposalRecordRepository;
import com.craftresourcemanagement.asset.repositories.MaintenanceRecordRepository;
import com.craftresourcemanagement.finance.repositories.*;
import com.craftresourcemanagement.hr.repositories.*;
import com.craftresourcemanagement.system.repositories.AuditLogRepository;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@TestConfiguration
public class HRTestConfig {

    @MockBean private AssetRepository assetRepository;
    @MockBean private MaintenanceRecordRepository maintenanceRecordRepository;
    @MockBean private DisposalRecordRepository disposalRecordRepository;
    @MockBean private AuditLogRepository auditLogRepository;
    @MockBean private UserRepository userRepository;
    @MockBean private PayrollRunRepository payrollRunRepository;
    @MockBean private PayslipRepository payslipRepository;
    @MockBean private BenefitPlanRepository benefitPlanRepository;
    @MockBean private EmployeeBenefitRepository employeeBenefitRepository;
    @MockBean private TrainingCourseRepository trainingCourseRepository;
    @MockBean private EmployeeTrainingRepository employeeTrainingRepository;
    @MockBean private PerformanceReviewRepository performanceReviewRepository;
    @MockBean private ChartOfAccountRepository chartOfAccountRepository;
    @MockBean private JournalEntryRepository journalEntryRepository;
    @MockBean private BudgetRepository budgetRepository;
    @MockBean private BudgetRequestRepository budgetRequestRepository;
    @MockBean private AccountPayableRepository accountPayableRepository;
    @MockBean private AccountReceivableRepository accountReceivableRepository;
    @MockBean private InvoiceSequenceRepository invoiceSequenceRepository;

    @Bean
    @Primary
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
