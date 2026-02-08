package com.craftresourcemanagement.hr.controllers;

import com.craftresourcemanagement.hr.entities.JobPosting;
import com.craftresourcemanagement.hr.entities.OnboardingChecklist;
import com.craftresourcemanagement.hr.repositories.JobPostingRepository;
import com.craftresourcemanagement.hr.repositories.OnboardingChecklistRepository;
import com.craftresourcemanagement.utils.AuditClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/hr/recruitment")
public class RecruitmentController {

    private final JobPostingRepository jobPostingRepository;
    private final OnboardingChecklistRepository onboardingChecklistRepository;
    private final AuditClient auditClient;

    public RecruitmentController(JobPostingRepository jobPostingRepository,
                                OnboardingChecklistRepository onboardingChecklistRepository,
                                AuditClient auditClient) {
        this.jobPostingRepository = jobPostingRepository;
        this.onboardingChecklistRepository = onboardingChecklistRepository;
        this.auditClient = auditClient;
    }

    @GetMapping("/job-postings")
    public ResponseEntity<List<JobPosting>> getAllJobPostings() {
        return ResponseEntity.ok(jobPostingRepository.findAll());
    }

    @GetMapping("/job-postings/open")
    public ResponseEntity<List<JobPosting>> getOpenJobPostings() {
        return ResponseEntity.ok(jobPostingRepository.findByStatus(JobPosting.JobPostingStatus.OPEN));
    }

    @PostMapping("/job-postings")
    public ResponseEntity<JobPosting> createJobPosting(@RequestBody JobPosting jobPosting) {
        JobPosting saved = jobPostingRepository.save(jobPosting);
        auditClient.logActionAsync(saved.getCreatedBy(), "created job posting",
            String.format("{\"module\":\"recruitment\",\"operation\":\"CREATE\",\"title\":\"%s\",\"status\":\"%s\"}",
                saved.getTitle(), saved.getStatus()), "java-backend", "JOB_POSTING", saved.getId().toString());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/job-postings/{id}")
    public ResponseEntity<JobPosting> updateJobPosting(@PathVariable Long id, @RequestBody JobPosting jobPosting) {
        return jobPostingRepository.findById(id)
            .map(existing -> {
                existing.setTitle(jobPosting.getTitle());
                existing.setDescription(jobPosting.getDescription());
                existing.setDepartmentId(jobPosting.getDepartmentId());
                existing.setJobGradeId(jobPosting.getJobGradeId());
                existing.setRequiredQualifications(jobPosting.getRequiredQualifications());
                existing.setClosingDate(jobPosting.getClosingDate());
                existing.setStatus(jobPosting.getStatus());
                JobPosting updated = jobPostingRepository.save(existing);
                auditClient.logActionAsync(updated.getCreatedBy(), "updated job posting",
                    String.format("{\"module\":\"recruitment\",\"operation\":\"UPDATE\",\"postingId\":%d,\"status\":\"%s\"}",
                        id, updated.getStatus()), "java-backend", "JOB_POSTING", id.toString());
                return ResponseEntity.ok(updated);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/onboarding/{userId}")
    public ResponseEntity<List<OnboardingChecklist>> getOnboardingChecklist(@PathVariable Long userId) {
        return ResponseEntity.ok(onboardingChecklistRepository.findByUserId(userId));
    }

    @PostMapping("/onboarding")
    public ResponseEntity<OnboardingChecklist> createOnboardingTask(@RequestBody OnboardingChecklist task) {
        task.setAssignedDate(LocalDateTime.now());
        OnboardingChecklist saved = onboardingChecklistRepository.save(task);
        auditClient.logActionAsync(saved.getUserId(), "assigned onboarding task",
            String.format("{\"module\":\"onboarding\",\"operation\":\"CREATE\",\"taskName\":\"%s\"}",
                saved.getTaskName()), "java-backend", "ONBOARDING_TASK", saved.getId().toString());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/onboarding/{id}/complete")
    public ResponseEntity<OnboardingChecklist> completeOnboardingTask(@PathVariable Long id) {
        return onboardingChecklistRepository.findById(id)
            .map(task -> {
                task.setIsCompleted(true);
                task.setCompletedAt(LocalDateTime.now());
                OnboardingChecklist updated = onboardingChecklistRepository.save(task);
                auditClient.logActionAsync(updated.getUserId(), "completed onboarding task",
                    String.format("{\"module\":\"onboarding\",\"operation\":\"COMPLETE\",\"taskId\":%d}", id),
                    "java-backend", "ONBOARDING_TASK", id.toString());
                return ResponseEntity.ok(updated);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/job-postings/{id}")
    public ResponseEntity<Void> deleteJobPosting(@PathVariable Long id) {
        return jobPostingRepository.findById(id)
            .map(posting -> {
                auditClient.logActionAsync(posting.getCreatedBy(), "deleted job posting",
                    String.format("{\"module\":\"recruitment\",\"operation\":\"DELETE\",\"postingId\":%d}", id),
                    "java-backend", "JOB_POSTING", id.toString());
                jobPostingRepository.deleteById(id);
                return ResponseEntity.noContent().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/onboarding/{id}")
    public ResponseEntity<Void> deleteOnboardingTask(@PathVariable Long id) {
        return onboardingChecklistRepository.findById(id)
            .map(task -> {
                auditClient.logActionAsync(task.getUserId(), "deleted onboarding task",
                    String.format("{\"module\":\"onboarding\",\"operation\":\"DELETE\",\"taskId\":%d}", id),
                    "java-backend", "ONBOARDING_TASK", id.toString());
                onboardingChecklistRepository.deleteById(id);
                return ResponseEntity.noContent().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
