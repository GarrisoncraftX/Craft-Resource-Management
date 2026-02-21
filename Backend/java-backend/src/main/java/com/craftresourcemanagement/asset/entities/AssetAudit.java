package com.craftresourcemanagement.asset.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "asset_audits")
public class AssetAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_id", nullable = false)
    @JsonProperty("assetId")
    private Long assetId;

    @Column(name = "audited_by")
    @JsonProperty("auditedBy")
    private Long auditedBy;

    @Column(name = "audit_date", nullable = false)
    @JsonProperty("auditDate")
    private LocalDateTime auditDate;

    @Column(name = "location_id")
    @JsonProperty("locationId")
    private Long locationId;

    @Column(name = "update_asset_location")
    @JsonProperty("updateAssetLocation")
    private Boolean updateAssetLocation = false;

    @Column(name = "next_audit_date")
    @JsonProperty("nextAuditDate")
    private LocalDate nextAuditDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "status")
    private String status = "draft";

    @Column(name = "images", columnDefinition = "LONGTEXT")
    private String images;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (auditDate == null) {
            auditDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public Long getAuditedBy() { return auditedBy; }
    public void setAuditedBy(Long auditedBy) { this.auditedBy = auditedBy; }

    public LocalDateTime getAuditDate() { return auditDate; }
    public void setAuditDate(LocalDateTime auditDate) { this.auditDate = auditDate; }

    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }

    public Boolean getUpdateAssetLocation() { return updateAssetLocation; }
    public void setUpdateAssetLocation(Boolean updateAssetLocation) { this.updateAssetLocation = updateAssetLocation; }

    public LocalDate getNextAuditDate() { return nextAuditDate; }
    public void setNextAuditDate(LocalDate nextAuditDate) { this.nextAuditDate = nextAuditDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
