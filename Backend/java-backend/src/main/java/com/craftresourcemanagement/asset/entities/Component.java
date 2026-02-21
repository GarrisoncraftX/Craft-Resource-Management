package com.craftresourcemanagement.asset.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "components")
public class Component {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "manufacturer_id")
    private Long manufacturerId;

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "company_id")
    private Long companyId;

    @Column(name = "location_id")
    private Long locationId;

    @Column(name = "model_no", length = 100)
    private String modelNo;

    @Column(length = 120)
    private String serial;

    @Column(name = "min_qty", nullable = false)
    private Integer minQty = 0;

    @Column(name = "qty_total", nullable = false)
    private Integer qtyTotal = 0;

    @Column(name = "qty_remaining", nullable = false)
    private Integer qtyRemaining = 0;

    @Column(name = "unit_cost", precision = 13, scale = 4)
    private BigDecimal unitCost;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

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
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Long getManufacturerId() { return manufacturerId; }
    public void setManufacturerId(Long manufacturerId) { this.manufacturerId = manufacturerId; }
    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }
    public String getModelNo() { return modelNo; }
    public void setModelNo(String modelNo) { this.modelNo = modelNo; }
    public String getSerial() { return serial; }
    public void setSerial(String serial) { this.serial = serial; }
    public Integer getMinQty() { return minQty; }
    public void setMinQty(Integer minQty) { this.minQty = minQty; }
    public Integer getQtyTotal() { return qtyTotal; }
    public void setQtyTotal(Integer qtyTotal) { this.qtyTotal = qtyTotal; }
    public Integer getQtyRemaining() { return qtyRemaining; }
    public void setQtyRemaining(Integer qtyRemaining) {
        if (qtyRemaining < 0) {
            throw new IllegalArgumentException("qty_remaining cannot be negative");
        }
        this.qtyRemaining = qtyRemaining;
    }
    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
}
