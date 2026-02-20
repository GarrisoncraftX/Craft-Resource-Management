package com.craftresourcemanagement.asset.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "asset_maintenances")
public class AssetMaintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_id", nullable = false)
    private Long assetId;

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "maintenance_type", nullable = false)
    private String maintenanceType;

    @Column(nullable = false)
    private String title;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "completion_date")
    private LocalDate completionDate;

    @Column(name = "asset_maintenance_time")
    private Integer assetMaintenanceTime;

    @Column(precision = 13, scale = 4)
    private BigDecimal cost;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "user_id")
    private Long userId;

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

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public String getMaintenanceType() { return maintenanceType; }
    public void setMaintenanceType(String maintenanceType) { this.maintenanceType = maintenanceType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getCompletionDate() { return completionDate; }
    public void setCompletionDate(LocalDate completionDate) { this.completionDate = completionDate; }

    public Integer getAssetMaintenanceTime() { return assetMaintenanceTime; }
    public void setAssetMaintenanceTime(Integer assetMaintenanceTime) { this.assetMaintenanceTime = assetMaintenanceTime; }

    public BigDecimal getCost() { return cost; }
    public void setCost(BigDecimal cost) { this.cost = cost; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
