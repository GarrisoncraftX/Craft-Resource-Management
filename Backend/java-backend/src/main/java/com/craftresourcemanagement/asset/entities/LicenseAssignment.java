package com.craftresourcemanagement.asset.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "license_assignments")
public class LicenseAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "license_id", nullable = false)
    private Long licenseId;

    @Column(name = "assigned_to_user_id")
    private Integer assignedToUserId;

    @Column(name = "assigned_to_asset_id")
    private Long assignedToAssetId;

    @Column(name = "assigned_at", nullable = false, updatable = false)
    private LocalDateTime assignedAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    protected void onCreate() {
        assignedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getLicenseId() { return licenseId; }
    public void setLicenseId(Long licenseId) { this.licenseId = licenseId; }
    public Integer getAssignedToUserId() { return assignedToUserId; }
    public void setAssignedToUserId(Integer assignedToUserId) { this.assignedToUserId = assignedToUserId; }
    public Long getAssignedToAssetId() { return assignedToAssetId; }
    public void setAssignedToAssetId(Long assignedToAssetId) { this.assignedToAssetId = assignedToAssetId; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public LocalDateTime getRevokedAt() { return revokedAt; }
    public void setRevokedAt(LocalDateTime revokedAt) { this.revokedAt = revokedAt; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
