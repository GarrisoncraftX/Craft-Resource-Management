package com.craftresourcemanagement.hr.unit;

import com.craftresourcemanagement.hr.HRTestConfig;
import com.craftresourcemanagement.hr.controllers.PayrollController;
import com.craftresourcemanagement.hr.controllers.ProcessPayrollRequest;
import com.craftresourcemanagement.hr.entities.*;
import com.craftresourcemanagement.hr.services.EmployeeService;
import com.craftresourcemanagement.hr.services.PayrollService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = PayrollController.class, 
    excludeAutoConfiguration = {SecurityAutoConfiguration.class, 
        org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class,
        org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration.class},
    properties = {"spring.main.allow-bean-definition-overriding=true"})
@Import(HRTestConfig.class)
class PayrollControllerUnitTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private PayrollService payrollService;
    @MockBean private EmployeeService employeeService;

    private PayrollRun testPayrollRun;
    private Payslip testPayslip;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmployeeId("EMP001");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");

        testPayrollRun = new PayrollRun();
        testPayrollRun.setStatus("PENDING");
        testPayrollRun.setStartDate(LocalDate.now().minusDays(30));
        testPayrollRun.setEndDate(LocalDate.now());

        testPayslip = new Payslip();
        testPayslip.setUser(testUser);
        testPayslip.setGrossPay(new BigDecimal("5000"));
        testPayslip.setNetPay(new BigDecimal("4500"));
        testPayslip.setPayrollRun(testPayrollRun);
    }

    @Test
    void createPayrollRun_Success() throws Exception {
        when(payrollService.createPayrollRun(any(PayrollRun.class))).thenReturn(testPayrollRun);

        mockMvc.perform(post("/hr/payroll/runs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPayrollRun)))
                .andExpect(status().isOk());
    }

    @Test
    void getAllPayrollRuns_Success() throws Exception {
        when(payrollService.getAllPayrollRuns()).thenReturn(Arrays.asList(testPayrollRun));

        mockMvc.perform(get("/hr/payroll/runs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    void getPayrollRunById_Found() throws Exception {
        when(payrollService.getPayrollRunById(1L)).thenReturn(testPayrollRun);

        mockMvc.perform(get("/hr/payroll/runs/1"))
                .andExpect(status().isOk());
    }

    @Test
    void getPayrollRunById_NotFound() throws Exception {
        when(payrollService.getPayrollRunById(999L)).thenReturn(null);

        mockMvc.perform(get("/hr/payroll/runs/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updatePayrollRun_Success() throws Exception {
        when(payrollService.updatePayrollRun(eq(1L), any(PayrollRun.class))).thenReturn(testPayrollRun);

        mockMvc.perform(put("/hr/payroll/runs/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPayrollRun)))
                .andExpect(status().isOk());
    }

    @Test
    void deletePayrollRun_Success() throws Exception {
        doNothing().when(payrollService).deletePayrollRun(1L);

        mockMvc.perform(delete("/hr/payroll/runs/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void createPayslip_Success() throws Exception {
        when(payrollService.createPayslip(any(Payslip.class))).thenReturn(testPayslip);

        mockMvc.perform(post("/hr/payroll/payslips")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPayslip)))
                .andExpect(status().isOk());
    }

    @Test
    void getAllPayslips_Success() throws Exception {
        when(payrollService.getAllPayslips()).thenReturn(Arrays.asList(testPayslip));

        mockMvc.perform(get("/hr/payroll/payslips"))
                .andExpect(status().isOk());
    }

    @Test
    void getPayslipsByUser_Success() throws Exception {
        when(employeeService.findById(1L)).thenReturn(Optional.of(testUser));
        when(payrollService.getPayslipsByUser(any(User.class))).thenReturn(Arrays.asList(testPayslip));

        mockMvc.perform(get("/hr/payroll/payslips/user/1"))
                .andExpect(status().isOk());
    }

    @Test
    void getPayslipsByUser_UserNotFound() throws Exception {
        when(employeeService.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/hr/payroll/payslips/user/999"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createBenefitPlan_Success() throws Exception {
        BenefitPlan plan = new BenefitPlan();
        plan.setPlanName("Health");
        when(payrollService.createBenefitPlan(any(BenefitPlan.class))).thenReturn(plan);

        mockMvc.perform(post("/hr/payroll/benefit-plans")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(plan)))
                .andExpect(status().isOk());
    }

    @Test
    void createTrainingCourse_Success() throws Exception {
        TrainingCourse course = new TrainingCourse();
        course.setCourseName("Java");
        when(payrollService.createTrainingCourse(any(TrainingCourse.class))).thenReturn(course);

        mockMvc.perform(post("/hr/payroll/training-courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(course)))
                .andExpect(status().isOk());
    }

    @Test
    void createPerformanceReview_Success() throws Exception {
        PerformanceReview review = new PerformanceReview();
        when(payrollService.createPerformanceReview(any(PerformanceReview.class))).thenReturn(review);

        mockMvc.perform(post("/hr/payroll/performance-reviews")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(review)))
                .andExpect(status().isOk());
    }

    @Test
    void processPayroll_Success() throws Exception {
        ProcessPayrollRequest request = new ProcessPayrollRequest();
        request.setStartDate(LocalDate.now().minusDays(30));
        request.setEndDate(LocalDate.now());
        request.setPayDate(LocalDate.now().plusDays(5));
        request.setCreatedBy(1L);

        when(payrollService.processPayroll(any(), any(), any(), any(), anyBoolean(), anyBoolean(), anyBoolean(), any()))
                .thenReturn(testPayrollRun);
        when(payrollService.getAllPayslips()).thenReturn(Arrays.asList(testPayslip));

        mockMvc.perform(post("/hr/payroll/process")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    @Test
    void generatePayrollReport_CSV_Success() throws Exception {
        when(payrollService.getPayrollRunById(1L)).thenReturn(testPayrollRun);
        when(payrollService.getAllPayslips()).thenReturn(Arrays.asList(testPayslip));

        mockMvc.perform(get("/hr/payroll/runs/1/report?format=csv"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv"));
    }

    @Test
    void generatePayrollReport_HTML_Success() throws Exception {
        testPayrollRun.setStatus("COMPLETED");
        when(payrollService.getPayrollRunById(1L)).thenReturn(testPayrollRun);
        when(payrollService.getAllPayslips()).thenReturn(Arrays.asList(testPayslip));

        mockMvc.perform(get("/hr/payroll/runs/1/report?format=html"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/html"));
    }

    @Test
    void generateBankFile_Success() throws Exception {
        testUser.setAccountNumber("123456");
        testUser.setBankName("Test Bank");
        when(payrollService.getPayrollRunById(1L)).thenReturn(testPayrollRun);
        when(payrollService.getAllPayslips()).thenReturn(Arrays.asList(testPayslip));

        mockMvc.perform(get("/hr/payroll/runs/1/bank-file"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv"));
    }
}
