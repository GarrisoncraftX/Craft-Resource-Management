package com.craftresourcemanagement.asset.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDate;

public class AssetDTO {
    private Long id;

    @JsonProperty("asset_tag")
    private String assetTag;

    @JsonProperty("asset_name")
    private String name;

    private String serial;

    @JsonProperty("model")
    private String modelName;

    @JsonProperty("model_id")
    private Long modelId;

    @JsonProperty("category")
    private String categoryName;

    @JsonProperty("status")
    private String statusName;

    @JsonProperty("status_id")
    private Long statusId;

    @JsonProperty("company_id")
    private Long companyId;

    @JsonProperty("company")
    private String companyName;

    @JsonProperty("location_id")
    private Long locationId;

    @JsonProperty("location")
    private String locationName;

    @JsonProperty("supplier_id")
    private Long supplierId;

    @JsonProperty("supplier")
    private String supplierName;

    @JsonProperty("manufacturer")
    private String manufacturerName;

    @JsonProperty("order_number")
    private String orderNumber;

    @JsonProperty("purchase_date")
    private LocalDate purchaseDate;

    @JsonProperty("purchase_cost")
    private BigDecimal purchaseCost;

    @JsonProperty("current_value")
    private BigDecimal currentValue;

    private String notes;

    @JsonProperty("expected_checkin")
    private LocalDate expectedCheckin;

    @JsonProperty("next_audit_date")
    private LocalDate nextAuditDate;

    private String image;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAssetTag() { return assetTag; }
    public void setAssetTag(String assetTag) { this.assetTag = assetTag; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSerial() { return serial; }
    public void setSerial(String serial) { this.serial = serial; }
    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }
    public Long getModelId() { return modelId; }
    public void setModelId(Long modelId) { this.modelId = modelId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getStatusName() { return statusName; }
    public void setStatusName(String statusName) { this.statusName = statusName; }
    public Long getStatusId() { return statusId; }
    public void setStatusId(Long statusId) { this.statusId = statusId; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }
    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }
    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
    public String getManufacturerName() { return manufacturerName; }
    public void setManufacturerName(String manufacturerName) { this.manufacturerName = manufacturerName; }
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }
    public BigDecimal getPurchaseCost() { return purchaseCost; }
    public void setPurchaseCost(BigDecimal purchaseCost) { this.purchaseCost = purchaseCost; }
    public BigDecimal getCurrentValue() { return currentValue; }
    public void setCurrentValue(BigDecimal currentValue) { this.currentValue = currentValue; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDate getExpectedCheckin() { return expectedCheckin; }
    public void setExpectedCheckin(LocalDate expectedCheckin) { this.expectedCheckin = expectedCheckin; }
    public LocalDate getNextAuditDate() { return nextAuditDate; }
    public void setNextAuditDate(LocalDate nextAuditDate) { this.nextAuditDate = nextAuditDate; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
