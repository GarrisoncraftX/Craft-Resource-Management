package com.craftresourcemanagement.asset.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public class ComponentDTO {
    private Long id;
    private String name;

    @JsonProperty("category_id")
    private Long categoryId;

    @JsonProperty("manufacturer_id")
    private Long manufacturerId;

    @JsonProperty("supplier_id")
    private Long supplierId;

    @JsonProperty("company_id")
    private Long companyId;

    @JsonProperty("location_id")
    private Long locationId;

    @JsonProperty("model_no")
    private String modelNo;

    private String serial;

    @JsonProperty("min_qty")
    private Integer minQty;

    @JsonProperty("qty_total")
    private Integer qtyTotal;

    @JsonProperty("qty_remaining")
    private Integer qtyRemaining;

    @JsonProperty("unit_cost")
    private BigDecimal unitCost;

    private String notes;

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
    public void setQtyRemaining(Integer qtyRemaining) { this.qtyRemaining = qtyRemaining; }
    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
