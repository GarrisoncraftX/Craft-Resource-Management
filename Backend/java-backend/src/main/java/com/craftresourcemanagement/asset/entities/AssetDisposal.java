package com.craftresourcemanagement.asset.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "asset_disposals")
public class AssetDisposal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_id", nullable = false)
    private Long assetId;

    @Column(name = "disposal_date", nullable = false)
    private LocalDate disposalDate;

    @Column(name = "disposal_method", nullable = false)
    private String disposalMethod;

    @Column(name = "disposal_reason", columnDefinition = "TEXT")
    private String disposalReason;

    @Column(precision = 13, scale = 4)
    private BigDecimal proceeds;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "disposed_by")
    private Long disposedBy;

    @Column(nullable = false)
    private String status = "pending";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public LocalDate getDisposalDate() { return disposalDate; }
    public void setDisposalDate(LocalDate disposalDate) { this.disposalDate = disposalDate; }

    public String getDisposalMethod() { return disposalMethod; }
    public void setDisposalMethod(String disposalMethod) { this.disposalMethod = disposalMethod; }

    public String getDisposalReason() { return disposalReason; }
    public void setDisposalReason(String disposalReason) { this.disposalReason = disposalReason; }

    public BigDecimal getProceeds() { return proceeds; }
    public void setProceeds(BigDecimal proceeds) { this.proceeds = proceeds; }

    public Long getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Long approvedBy) { this.approvedBy = approvedBy; }

    public Long getDisposedBy() { return disposedBy; }
    public void setDisposedBy(Long disposedBy) { this.disposedBy = disposedBy; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
