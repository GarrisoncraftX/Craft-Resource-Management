package com.craftresourcemanagement.hr.integration;

import com.craftresourcemanagement.hr.entities.*;
import com.craftresourcemanagement.hr.entities.JobPosting.JobPostingStatus;
import com.craftresourcemanagement.hr.repositories.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
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
class RecruitmentOnboardingIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JobPostingRepository jobPostingRepository;
    @Autowired private OnboardingChecklistRepository onboardingRepository;
    @Autowired private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        onboardingRepository.deleteAll();
        jobPostingRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User();
        testUser.setEmployeeId("EMP999");
        testUser.setFirstName("New");
        testUser.setLastName("Hire");
        testUser.setEmail("newhire@test.com");
        testUser.setPassword("pass123");
        testUser.setDepartmentId(1);
        testUser.setRoleId(5);
        testUser = userRepository.save(testUser);
    }

    @Test
    void createJobPosting_Success() throws Exception {
        JobPosting job = new JobPosting();
        job.setTitle("Software Engineer");
        job.setDescription("Java Developer");
        job.setStatus(JobPosting.JobPostingStatus.OPEN);
        job.setClosingDate(LocalDate.now().plusDays(30));

        mockMvc.perform(post("/hr/recruitment/job-postings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(job)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Software Engineer"));
    }

    @Test
    void getAllJobPostings_Success() throws Exception {
        mockMvc.perform(get("/hr/recruitment/job-postings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createOnboardingTask_Success() throws Exception {
        OnboardingChecklist task = new OnboardingChecklist();
        task.setUserId(testUser.getId());
        task.setTaskName("Complete orientation");
        task.setIsCompleted(false);

        mockMvc.perform(post("/hr/recruitment/onboarding")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(task)))
                .andExpect(status().isOk());
    }

    @Test
    void getOnboardingChecklist_Success() throws Exception {
        OnboardingChecklist task = new OnboardingChecklist();
        task.setUserId(testUser.getId());
        task.setTaskName("Setup workstation");
        task.setIsCompleted(false);
        onboardingRepository.save(task);

        mockMvc.perform(get("/hr/recruitment/onboarding/" + testUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void completeOnboardingTask_Success() throws Exception {
        OnboardingChecklist task = new OnboardingChecklist();
        task.setUserId(testUser.getId());
        task.setTaskName("Sign documents");
        task.setIsCompleted(false);
        OnboardingChecklist saved = onboardingRepository.save(task);

        mockMvc.perform(put("/hr/recruitment/onboarding/" + saved.getId() + "/complete")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    void fullRecruitmentWorkflow_Success() throws Exception {
        JobPosting job = new JobPosting();
        job.setTitle("DevOps Engineer");
        job.setDescription("Cloud Infrastructure");
        job.setStatus(JobPostingStatus.OPEN);
        job.setClosingDate(LocalDate.now().plusDays(30));
        
        String response = mockMvc.perform(post("/hr/recruitment/job-postings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(job)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JobPosting created = objectMapper.readValue(response, JobPosting.class);

        created.setStatus(JobPosting.JobPostingStatus.FILLED);
        mockMvc.perform(put("/hr/recruitment/job-postings/" + created.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(created)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FILLED"));
    }
}
