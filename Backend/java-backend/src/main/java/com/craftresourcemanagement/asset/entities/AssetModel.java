package com.craftresourcemanagement.asset.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "asset_models")
public class AssetModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "model_number", length = 100)
    private String modelNumber;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "manufacturer_id")
    private Long manufacturerId;

    @Column(name = "depreciation_id")
    private Long depreciationId;

    @Column(name = "eol")
    private Integer eol;

    @Column(name = "min_amt")
    private Integer minAmt;

    @Column(length = 255)
    private String image;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "requestable")
    private Boolean requestable = false;

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
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getModelNumber() { return modelNumber; }
    public void setModelNumber(String modelNumber) { this.modelNumber = modelNumber; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Long getManufacturerId() { return manufacturerId; }
    public void setManufacturerId(Long manufacturerId) { this.manufacturerId = manufacturerId; }
    public Long getDepreciationId() { return depreciationId; }
    public void setDepreciationId(Long depreciationId) { this.depreciationId = depreciationId; }
    public Integer getEol() { return eol; }
    public void setEol(Integer eol) { this.eol = eol; }
    public Integer getMinAmt() { return minAmt; }
    public void setMinAmt(Integer minAmt) { this.minAmt = minAmt; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Boolean getRequestable() { return requestable; }
    public void setRequestable(Boolean requestable) { this.requestable = requestable; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
