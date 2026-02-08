package com.craftresourcemanagement.hr.unit;

import com.craftresourcemanagement.hr.HRTestConfig;
import com.craftresourcemanagement.hr.controllers.EmployeeController;
import com.craftresourcemanagement.hr.controllers.UpdateEmployeeRequest;
import com.craftresourcemanagement.hr.entities.User;
import com.craftresourcemanagement.hr.services.CloudinaryService;
import com.craftresourcemanagement.hr.services.EmployeeService;
import com.craftresourcemanagement.hr.services.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = EmployeeController.class, 
    excludeAutoConfiguration = {SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class,
        org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration.class},
    properties = {"spring.main.allow-bean-definition-overriding=true"})
@Import(HRTestConfig.class)
class EmployeeControllerUnitTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private EmployeeService employeeService;
    @MockBean private CloudinaryService cloudinaryService;
    @MockBean private NotificationService notificationService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmployeeId("EMP001");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setEmail("john@test.com");
        testUser.setDepartmentId(1);
        testUser.setRoleId(5);
        testUser.setHireDate(LocalDate.now());
    }

    @Test
    void registerEmployee_NewEmployee_Success() throws Exception {
        User newUser = new User();
        newUser.setFirstName("Jane");
        newUser.setEmail("jane@test.com");
        newUser.setEmployeeId("EMP002");
        newUser.setTemporaryPassword("temp123");

        when(employeeService.registerEmployee(any(User.class))).thenReturn(newUser);

        mockMvc.perform(post("/hr/employees/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newUser)))
                .andExpect(status().isOk());
    }

    @Test
    void registerEmployee_Failure() throws Exception {
        when(employeeService.registerEmployee(any(User.class)))
                .thenThrow(new RuntimeException("Email exists"));

        mockMvc.perform(post("/hr/employees/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listEmployees_Success() throws Exception {
        when(employeeService.listAllEmployees()).thenReturn(Arrays.asList(testUser));

        mockMvc.perform(get("/hr/employees/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].employeeId").value("EMP001"));
    }

    @Test
    void getProvisionedEmployees_Success() throws Exception {
        when(employeeService.getProvisionedEmployees()).thenReturn(Arrays.asList(testUser));

        mockMvc.perform(get("/hr/employees/provisioned"))
                .andExpect(status().isOk());
    }

    @Test
    void getEmployeeById_Found() throws Exception {
        when(employeeService.findById(1L)).thenReturn(Optional.of(testUser));

        mockMvc.perform(get("/hr/employees/id/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value("EMP001"));
    }

    @Test
    void getEmployeeById_NotFound() throws Exception {
        when(employeeService.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/hr/employees/id/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateEmployee_Success() throws Exception {
        UpdateEmployeeRequest request = new UpdateEmployeeRequest();
        request.setFirstName("Updated");

        when(employeeService.findById(1L)).thenReturn(Optional.of(testUser));
        when(employeeService.registerEmployee(any(User.class))).thenReturn(testUser);

        mockMvc.perform(put("/hr/employees/id/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void updateEmployee_PasswordMismatch() throws Exception {
        UpdateEmployeeRequest request = new UpdateEmployeeRequest();
        request.setPassword("pass1");
        request.setConfirmPassword("pass2");

        when(employeeService.findById(1L)).thenReturn(Optional.of(testUser));

        mockMvc.perform(put("/hr/employees/id/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateProfilePicture_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "data".getBytes());

        when(employeeService.findById(1L)).thenReturn(Optional.of(testUser));
        when(cloudinaryService.uploadImage(any())).thenReturn("http://url.com/image.jpg");
        when(employeeService.registerEmployee(any(User.class))).thenReturn(testUser);

        mockMvc.perform(multipart("/hr/employees/id/1/profile-picture").file(file)
                .with(request -> { request.setMethod("PUT"); return request; }))
                .andExpect(status().isOk());
    }

    @Test
    void updateProfilePicture_InvalidType() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "data".getBytes());

        mockMvc.perform(multipart("/hr/employees/id/1/profile-picture").file(file)
                .with(request -> { request.setMethod("PUT"); return request; }))
                .andExpect(status().isBadRequest());
    }

    @Test
    void toggleUserStatus_Success() throws Exception {
        when(employeeService.toggleUserStatus(1L)).thenReturn(testUser);

        mockMvc.perform(put("/hr/employees/id/1/toggle-status"))
                .andExpect(status().isOk());
    }

    @Test
    void testBirthdayNotifications_Success() throws Exception {
        when(employeeService.getEmployeesWithBirthdayToday()).thenReturn(Arrays.asList(testUser));
        when(employeeService.getEmployeesWithAnniversaryToday()).thenReturn(Arrays.asList());

        mockMvc.perform(post("/hr/employees/test-birthday-notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.birthdayCount").value(1));
    }
}
