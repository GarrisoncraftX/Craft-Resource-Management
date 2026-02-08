package com.craftresourcemanagement.hr.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_offboarding")
public class EmployeeOffboarding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "resignation_date")
    private LocalDate resignationDate;

    @Column(name = "last_working_date")
    private LocalDate lastWorkingDate;

    @Column(name = "offboarding_type")
    private String offboardingType; // RESIGNATION, TERMINATION, RETIREMENT, CONTRACT_END

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "status")
    private String status; // NOTICE_PERIOD, IN_PROGRESS, COMPLETED

    @Column(name = "exit_interview_scheduled")
    private Boolean exitInterviewScheduled = false;

    @Column(name = "exit_interview_date")
    private LocalDateTime exitInterviewDate;

    @Column(name = "assets_returned")
    private Boolean assetsReturned = false;

    @Column(name = "clearance_completed")
    private Boolean clearanceCompleted = false;

    @Column(name = "final_settlement_amount")
    private Double finalSettlementAmount;

    @Column(name = "final_settlement_paid")
    private Boolean finalSettlementPaid = false;

    @Column(name = "access_revoked")
    private Boolean accessRevoked = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public LocalDate getResignationDate() { return resignationDate; }
    public void setResignationDate(LocalDate resignationDate) { this.resignationDate = resignationDate; }

    public LocalDate getLastWorkingDate() { return lastWorkingDate; }
    public void setLastWorkingDate(LocalDate lastWorkingDate) { this.lastWorkingDate = lastWorkingDate; }

    public String getOffboardingType() { return offboardingType; }
    public void setOffboardingType(String offboardingType) { this.offboardingType = offboardingType; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getExitInterviewScheduled() { return exitInterviewScheduled; }
    public void setExitInterviewScheduled(Boolean exitInterviewScheduled) { this.exitInterviewScheduled = exitInterviewScheduled; }

    public LocalDateTime getExitInterviewDate() { return exitInterviewDate; }
    public void setExitInterviewDate(LocalDateTime exitInterviewDate) { this.exitInterviewDate = exitInterviewDate; }

    public Boolean getAssetsReturned() { return assetsReturned; }
    public void setAssetsReturned(Boolean assetsReturned) { this.assetsReturned = assetsReturned; }

    public Boolean getClearanceCompleted() { return clearanceCompleted; }
    public void setClearanceCompleted(Boolean clearanceCompleted) { this.clearanceCompleted = clearanceCompleted; }

    public Double getFinalSettlementAmount() { return finalSettlementAmount; }
    public void setFinalSettlementAmount(Double finalSettlementAmount) { this.finalSettlementAmount = finalSettlementAmount; }

    public Boolean getFinalSettlementPaid() { return finalSettlementPaid; }
    public void setFinalSettlementPaid(Boolean finalSettlementPaid) { this.finalSettlementPaid = finalSettlementPaid; }

    public Boolean getAccessRevoked() { return accessRevoked; }
    public void setAccessRevoked(Boolean accessRevoked) { this.accessRevoked = accessRevoked; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
}
