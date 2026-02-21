package com.craftresourcemanagement.asset.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDate;

public class LicenseDTO {
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

    @JsonProperty("product_key")
    private String productKey;

    @JsonProperty("seats_total")
    private Integer seatsTotal;

    @JsonProperty("seats_used")
    private Integer seatsUsed;

    @JsonProperty("available_seats")
    private Integer availableSeats;

    @JsonProperty("purchase_date")
    private LocalDate purchaseDate;

    @JsonProperty("expiration_date")
    private LocalDate expirationDate;

    @JsonProperty("purchase_cost")
    private BigDecimal purchaseCost;

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
    public String getProductKey() { return productKey; }
    public void setProductKey(String productKey) { this.productKey = productKey; }
    public Integer getSeatsTotal() { return seatsTotal; }
    public void setSeatsTotal(Integer seatsTotal) { 
        this.seatsTotal = seatsTotal;
        updateAvailableSeats();
    }
    public Integer getSeatsUsed() { return seatsUsed; }
    public void setSeatsUsed(Integer seatsUsed) { 
        this.seatsUsed = seatsUsed;
        updateAvailableSeats();
    }
    public Integer getAvailableSeats() { return availableSeats; }
    private void updateAvailableSeats() {
        if (seatsTotal != null && seatsUsed != null) {
            this.availableSeats = seatsTotal - seatsUsed;
        }
    }
    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }
    public LocalDate getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDate expirationDate) { this.expirationDate = expirationDate; }
    public BigDecimal getPurchaseCost() { return purchaseCost; }
    public void setPurchaseCost(BigDecimal purchaseCost) { this.purchaseCost = purchaseCost; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
