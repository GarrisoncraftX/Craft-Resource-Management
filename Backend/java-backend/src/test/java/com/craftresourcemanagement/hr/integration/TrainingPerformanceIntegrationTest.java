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

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
@Disabled("Integration tests require MySQL stored procedures - run manually with MySQL")
class TrainingPerformanceIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private TrainingCourseRepository trainingCourseRepository;
    @Autowired private EmployeeTrainingRepository employeeTrainingRepository;
    @Autowired private PerformanceReviewRepository performanceReviewRepository;
    @Autowired private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        employeeTrainingRepository.deleteAll();
        trainingCourseRepository.deleteAll();
        performanceReviewRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User();
        testUser.setEmployeeId("EMP777");
        testUser.setFirstName("Training");
        testUser.setLastName("Test");
        testUser.setEmail("training@test.com");
        testUser.setPassword("pass123");
        testUser.setDepartmentId(1);
        testUser.setRoleId(5);
        testUser.setHireDate(LocalDate.now());
        testUser = userRepository.save(testUser);
    }

    @Test
    void createTrainingCourse_Success() throws Exception {
        TrainingCourse course = new TrainingCourse();
        course.setCourseName("Spring Boot Mastery");
        course.setDescription("Advanced Spring Boot");
        course.setStartDate(LocalDate.now());
        course.setEndDate(LocalDate.now().plusDays(30));

        mockMvc.perform(post("/hr/payroll/training-courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(course)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/hr/payroll/training-courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].courseName").value("Spring Boot Mastery"));
    }

    @Test
    void enrollEmployeeInTraining_Success() throws Exception {
        TrainingCourse course = new TrainingCourse();
        course.setCourseName("Python Basics");
        course.setStartDate(LocalDate.now());
        course.setEndDate(LocalDate.now().plusDays(15));
        course = trainingCourseRepository.save(course);

        EmployeeTraining training = new EmployeeTraining();
        training.setEnrollmentDate(LocalDate.now());

        mockMvc.perform(post("/hr/payroll/employee-trainings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(training)))
                .andExpect(status().isOk());
    }

    @Test
    void createPerformanceReview_Success() throws Exception {
        PerformanceReview review = new PerformanceReview();
        review.setEmployeeId(testUser.getId());
        review.setReviewerId(1L);
        review.setReviewDate(LocalDate.now());
        review.setRating(4.5);
        review.setStatus("PENDING");

        mockMvc.perform(post("/hr/payroll/performance-reviews")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(review)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/hr/payroll/performance-reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].rating").value(4.5));
    }

    @Test
    void updatePerformanceReview_Success() throws Exception {
        PerformanceReview review = new PerformanceReview();
        review.setEmployeeId(testUser.getId());
        review.setReviewerId(1L);
        review.setReviewDate(LocalDate.now());
        review.setRating(4.0);
        review.setStatus("PENDING");
        review = performanceReviewRepository.save(review);

        review.setStatus("COMPLETED");
        review.setRating(5.0);

        mockMvc.perform(put("/hr/payroll/performance-reviews/" + review.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(review)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void deleteTrainingCourse_Success() throws Exception {
        TrainingCourse course = new TrainingCourse();
        course.setCourseName("Delete Test");
        course.setStartDate(LocalDate.now());
        course.setEndDate(LocalDate.now().plusDays(10));
        course = trainingCourseRepository.save(course);

        mockMvc.perform(delete("/hr/payroll/training-courses/" + course.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void getAllEmployeeTrainings_Success() throws Exception {
        mockMvc.perform(get("/hr/payroll/employee-trainings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
