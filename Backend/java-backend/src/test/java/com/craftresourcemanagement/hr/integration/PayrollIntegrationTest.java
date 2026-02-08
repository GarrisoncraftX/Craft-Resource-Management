package com.craftresourcemanagement.hr.integration;

import com.craftresourcemanagement.hr.entities.*;
import com.craftresourcemanagement.hr.repositories.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
class PayrollIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private PayrollRunRepository payrollRunRepository;
    @Autowired private PayslipRepository payslipRepository;
    @Autowired private UserRepository userRepository;

    private User testUser;
    private PayrollRun testPayrollRun;

    @BeforeEach
    void setUp() {
        payslipRepository.deleteAll();
        payrollRunRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User();
        testUser.setEmployeeId("EMP888");
        testUser.setFirstName("Payroll");
        testUser.setLastName("Test");
        testUser.setEmail("payroll@test.com");
        testUser.setPassword("pass123");
        testUser.setDepartmentId(1);
        testUser.setRoleId(5);
        testUser.setSalary(5000.0);
        testUser.setHireDate(LocalDate.now());
        testUser = userRepository.save(testUser);

        testPayrollRun = new PayrollRun();
        testPayrollRun.setStartDate(LocalDate.now().minusDays(30));
        testPayrollRun.setEndDate(LocalDate.now());
        testPayrollRun.setStatus("PENDING");
    }

    @Test
    void createAndRetrievePayrollRun_Success() throws Exception {
        mockMvc.perform(post("/hr/payroll/runs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPayrollRun)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/hr/payroll/runs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createPayslip_Success() throws Exception {
        PayrollRun saved = payrollRunRepository.save(testPayrollRun);

        Payslip payslip = new Payslip();
        payslip.setUser(testUser);
        payslip.setPayrollRun(saved);
        payslip.setGrossPay(new BigDecimal("5000"));
        payslip.setNetPay(new BigDecimal("4500"));
        payslip.setTaxDeductions(new BigDecimal("500"));
        payslip.setOtherDeductions(new BigDecimal("0"));

        mockMvc.perform(post("/hr/payroll/payslips")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payslip)))
                .andExpect(status().isOk());
    }

    @Test
    void getPayslipsByUser_Success() throws Exception {
        mockMvc.perform(get("/hr/payroll/payslips/user/" + testUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createBenefitPlan_Success() throws Exception {
        BenefitPlan plan = new BenefitPlan();
        plan.setPlanName("Health Insurance");
        plan.setContributionAmount(new BigDecimal("100"));

        mockMvc.perform(post("/hr/payroll/benefit-plans")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(plan)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/hr/payroll/benefit-plans"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].planName").value("Health Insurance"));
    }

    @Test
    void createTrainingCourse_Success() throws Exception {
        TrainingCourse course = new TrainingCourse();
        course.setCourseName("Java Advanced");
        course.setStartDate(LocalDate.now());
        course.setEndDate(LocalDate.now().plusDays(30));

        mockMvc.perform(post("/hr/payroll/training-courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(course)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/hr/payroll/training-courses"))
                .andExpect(status().isOk());
    }

    @Test
    void updatePayrollRun_Success() throws Exception {
        PayrollRun saved = payrollRunRepository.save(testPayrollRun);
        saved.setStatus("COMPLETED");

        mockMvc.perform(put("/hr/payroll/runs/" + saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(saved)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void deletePayrollRun_Success() throws Exception {
        PayrollRun saved = payrollRunRepository.save(testPayrollRun);

        mockMvc.perform(delete("/hr/payroll/runs/" + saved.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void generatePayrollReport_Success() throws Exception {
        PayrollRun saved = payrollRunRepository.save(testPayrollRun);

        Payslip payslip = new Payslip();
        payslip.setUser(testUser);
        payslip.setPayrollRun(saved);
        payslip.setGrossPay(new BigDecimal("5000"));
        payslip.setNetPay(new BigDecimal("4500"));
        payslip.setTaxDeductions(new BigDecimal("500"));
        payslip.setOtherDeductions(new BigDecimal("0"));
        payslipRepository.save(payslip);

        mockMvc.perform(get("/hr/payroll/runs/" + saved.getId() + "/report?format=csv"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv"));
    }

    @Test
    void processPayrollWithAttendanceIntegration_Success() throws Exception {
        String request = "{\"startDate\":\"2024-01-01\",\"endDate\":\"2024-01-31\",\"payDate\":\"2024-02-01\",\"departmentId\":1,\"includeOvertime\":true,\"includeBonuses\":true,\"includeDeductions\":true,\"createdBy\":1}";
        
        mockMvc.perform(post("/hr/payroll/process")
                .contentType(MediaType.APPLICATION_JSON)
                .content(request))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    @Test
    void getAttendanceReview_Success() throws Exception {
        mockMvc.perform(get("/hr/payroll/attendance-review/" + testUser.getId() + "?startDate=2024-01-01&endDate=2024-01-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(testUser.getId()));
    }
}
