package com.craftresourcemanagement.hr.entities;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "job_postings")
public class JobPosting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "department_id")
    private Integer departmentId;

    @Column(name = "job_grade_id")
    private Integer jobGradeId;

    @Column(name = "required_qualifications", columnDefinition = "TEXT")
    private String requiredQualifications;

    @Column(name = "posting_date")
    private LocalDate postingDate;

    @Column(name = "closing_date")
    private LocalDate closingDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobPostingStatus status = JobPostingStatus.DRAFT;

    @Column(name = "created_by")
    private Long createdBy;

    public enum JobPostingStatus {
        DRAFT, OPEN, CLOSED, FILLED
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getDepartmentId() { return departmentId; }
    public void setDepartmentId(Integer departmentId) { this.departmentId = departmentId; }
    public Integer getJobGradeId() { return jobGradeId; }
    public void setJobGradeId(Integer jobGradeId) { this.jobGradeId = jobGradeId; }
    public String getRequiredQualifications() { return requiredQualifications; }
    public void setRequiredQualifications(String requiredQualifications) { this.requiredQualifications = requiredQualifications; }
    public LocalDate getPostingDate() { return postingDate; }
    public void setPostingDate(LocalDate postingDate) { this.postingDate = postingDate; }
    public LocalDate getClosingDate() { return closingDate; }
    public void setClosingDate(LocalDate closingDate) { this.closingDate = closingDate; }
    public JobPostingStatus getStatus() { return status; }
    public void setStatus(JobPostingStatus status) { this.status = status; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
}
