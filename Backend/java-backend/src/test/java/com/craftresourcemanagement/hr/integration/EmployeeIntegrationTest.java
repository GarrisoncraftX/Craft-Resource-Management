package com.craftresourcemanagement.hr.integration;

import com.craftresourcemanagement.hr.entities.User;
import com.craftresourcemanagement.hr.repositories.UserRepository;
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

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
@Disabled("Integration tests require MySQL stored procedures - run manually with MySQL")
class EmployeeIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        
        testUser = new User();
        testUser.setEmployeeId("EMP999");
        testUser.setFirstName("Integration");
        testUser.setLastName("Test");
        testUser.setEmail("integration@test.com");
        testUser.setPassword("password123");
        testUser.setDepartmentId(1);
        testUser.setRoleId(5);
        testUser.setHireDate(LocalDate.now());
        testUser.setIsActive(1);
    }

    @Test
    void fullEmployeeLifecycle_Success() throws Exception {
        // Create employee
        mockMvc.perform(post("/hr/employees/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isOk());

        // List employees
        mockMvc.perform(get("/hr/employees/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Get by ID
        User saved = userRepository.findAll().get(0);
        mockMvc.perform(get("/hr/employees/id/" + saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("integration@test.com"));

        // Toggle status
        mockMvc.perform(put("/hr/employees/id/" + saved.getId() + "/toggle-status"))
                .andExpect(status().isOk());
    }

    @Test
    void registerEmployee_DuplicateEmail_Fails() throws Exception {
        userRepository.save(testUser);

        User duplicate = new User();
        duplicate.setEmail("integration@test.com");
        duplicate.setFirstName("Duplicate");
        duplicate.setLastName("User");
        duplicate.setDepartmentId(1);
        duplicate.setRoleId(5);

        mockMvc.perform(post("/hr/employees/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateEmployee_Success() throws Exception {
        User saved = userRepository.save(testUser);

        saved.setFirstName("Updated");
        mockMvc.perform(put("/hr/employees/id/" + saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(saved)))
                .andExpect(status().isOk());
    }
}
