package com.craftresourcemanagement.hr.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime clockInTime;

    private LocalDateTime clockOutTime;

    private String status;

    // Pillar 2: Fail-Safe Attendance Governance fields
    @Column(name = "clock_in_method")
    private String clockInMethod; // 'qr', 'manual', 'biometric'

    @Column(name = "clock_out_method")
    private String clockOutMethod; // 'qr', 'manual', 'biometric'

    @Column(name = "manual_fallback_flag")
    private Boolean manualFallbackFlag; // true if manual method used

    @Column(name = "audit_notes")
    private String auditNotes; // HR audit notes for manual entries

    // Pillar 2: Additional governance fields
    @Column(name = "flagged_for_review")
    private Boolean flaggedForReview = false; // HR dashboard flag

    @Column(name = "flagged_at")
    private LocalDateTime flaggedAt;

    @Column(name = "flagged_by")
    private Long flaggedBy; // HR user ID who flagged

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by")
    private Long reviewedBy; // HR user ID who reviewed

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getClockInTime() {
        return clockInTime;
    }

    public void setClockInTime(LocalDateTime clockInTime) {
        this.clockInTime = clockInTime;
    }

    public LocalDateTime getClockOutTime() {
        return clockOutTime;
    }

    public void setClockOutTime(LocalDateTime clockOutTime) {
        this.clockOutTime = clockOutTime;
    }

    public String getStatus(){
        return status;
    }

     public void setStatus(String status){
        this.status = status;
    }

    public String getClockInMethod() {
        return clockInMethod;
    }

    public void setClockInMethod(String clockInMethod) {
        this.clockInMethod = clockInMethod;
        // Pillar 2: Set manual fallback flag if manual method is used
        if ("manual".equals(clockInMethod)) {
            this.manualFallbackFlag = true;
        }
    }

    public String getClockOutMethod() {
        return clockOutMethod;
    }

    public void setClockOutMethod(String clockOutMethod) {
        this.clockOutMethod = clockOutMethod;
        // Pillar 2: Set manual fallback flag if manual method is used
        if ("manual".equals(clockOutMethod)) {
            this.manualFallbackFlag = true;
        }
    }

    public Boolean getManualFallbackFlag() {
        return manualFallbackFlag;
    }

    public void setManualFallbackFlag(Boolean manualFallbackFlag) {
        this.manualFallbackFlag = manualFallbackFlag;
    }

    public String getAuditNotes() {
        return auditNotes;
    }

    public void setAuditNotes(String auditNotes) {
        this.auditNotes = auditNotes;
    }

    public Boolean getFlaggedForReview() {
        return flaggedForReview;
    }

    public void setFlaggedForReview(Boolean flaggedForReview) {
        this.flaggedForReview = flaggedForReview;
    }

    public LocalDateTime getFlaggedAt() {
        return flaggedAt;
    }

    public void setFlaggedAt(LocalDateTime flaggedAt) {
        this.flaggedAt = flaggedAt;
    }

    public Long getFlaggedBy() {
        return flaggedBy;
    }

    public void setFlaggedBy(Long flaggedBy) {
        this.flaggedBy = flaggedBy;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public Long getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(Long reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

}
