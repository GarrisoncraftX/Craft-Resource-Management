package com.craftresourcemanagement.asset.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_tag", nullable = false, unique = true)
    @JsonProperty("assetTag")
    private String assetTag;

    @Column(name = "name")
    private String name;

    @Column(name = "serial")
    private String serial;

    @Column(name = "model_id", nullable = false)
    @JsonProperty("modelId")
    private Long modelId;

    @Column(name = "status_id", nullable = false)
    @JsonProperty("statusId")
    private Long statusId;

    @Column(name = "company_id")
    @JsonProperty("companyId")
    private Long companyId;

    @Column(name = "location_id")
    @JsonProperty("locationId")
    private Long locationId;

    @Column(name = "rtd_location_id")
    @JsonProperty("rtdLocationId")
    private Long rtdLocationId;

    @Column(name = "supplier_id")
    @JsonProperty("supplierId")
    private Long supplierId;

    @Column(name = "order_number")
    @JsonProperty("orderNumber")
    private String orderNumber;

    @Column(name = "purchase_date")
    @JsonProperty("purchaseDate")
    private LocalDate purchaseDate;

    @Column(name = "purchase_cost", precision = 13, scale = 4)
    @JsonProperty("purchaseCost")
    private BigDecimal purchaseCost;

    @Column(name = "warranty_months")
    @JsonProperty("warrantyMonths")
    private Integer warrantyMonths;

    @Column(name = "eol_date")
    @JsonProperty("eolDate")
    private LocalDate eolDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "image")
    private String image;

    @Column(name = "assigned_to")
    @JsonProperty("assignedTo")
    private Long assignedTo;

    @Column(name = "assigned_type")
    @JsonProperty("assignedType")
    private String assignedType;

    @Column(name = "requestable")
    private Boolean requestable = false;

    @Column(name = "last_checkout")
    @JsonProperty("lastCheckout")
    private LocalDateTime lastCheckout;

    @Column(name = "expected_checkin")
    @JsonProperty("expectedCheckin")
    private LocalDate expectedCheckin;

    @Column(name = "last_audit_date")
    @JsonProperty("lastAuditDate")
    private LocalDateTime lastAuditDate;

    @Column(name = "next_audit_date")
    @JsonProperty("nextAuditDate")
    private LocalDate nextAuditDate;

    @Column(name = "byod")
    private Boolean byod = false;

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

    public String getAssetTag() { return assetTag; }
    public void setAssetTag(String assetTag) { this.assetTag = assetTag; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSerial() { return serial; }
    public void setSerial(String serial) { this.serial = serial; }

    public Long getModelId() { return modelId; }
    public void setModelId(Long modelId) { this.modelId = modelId; }

    public Long getStatusId() { return statusId; }
    public void setStatusId(Long statusId) { this.statusId = statusId; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }

    public Long getRtdLocationId() { return rtdLocationId; }
    public void setRtdLocationId(Long rtdLocationId) { this.rtdLocationId = rtdLocationId; }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }

    public BigDecimal getPurchaseCost() { return purchaseCost; }
    public void setPurchaseCost(BigDecimal purchaseCost) { this.purchaseCost = purchaseCost; }

    public Integer getWarrantyMonths() { return warrantyMonths; }
    public void setWarrantyMonths(Integer warrantyMonths) { this.warrantyMonths = warrantyMonths; }

    public LocalDate getEolDate() { return eolDate; }
    public void setEolDate(LocalDate eolDate) { this.eolDate = eolDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public Long getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Long assignedTo) { this.assignedTo = assignedTo; }

    public String getAssignedType() { return assignedType; }
    public void setAssignedType(String assignedType) { this.assignedType = assignedType; }

    public Boolean getRequestable() { return requestable; }
    public void setRequestable(Boolean requestable) { this.requestable = requestable; }

    public LocalDateTime getLastCheckout() { return lastCheckout; }
    public void setLastCheckout(LocalDateTime lastCheckout) { this.lastCheckout = lastCheckout; }

    public LocalDate getExpectedCheckin() { return expectedCheckin; }
    public void setExpectedCheckin(LocalDate expectedCheckin) { this.expectedCheckin = expectedCheckin; }

    public LocalDateTime getLastAuditDate() { return lastAuditDate; }
    public void setLastAuditDate(LocalDateTime lastAuditDate) { this.lastAuditDate = lastAuditDate; }

    public LocalDate getNextAuditDate() { return nextAuditDate; }
    public void setNextAuditDate(LocalDate nextAuditDate) { this.nextAuditDate = nextAuditDate; }

    public Boolean getByod() { return byod; }
    public void setByod(Boolean byod) { this.byod = byod; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
