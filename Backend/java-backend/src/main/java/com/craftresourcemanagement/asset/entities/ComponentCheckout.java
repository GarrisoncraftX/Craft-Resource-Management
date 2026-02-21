package com.craftresourcemanagement.asset.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "component_checkouts")
public class ComponentCheckout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "component_id", nullable = false)
    private Long componentId;

    @Column(name = "asset_id")
    private Long assetId;

    @Column(name = "checked_out_to_user_id")
    private Integer checkedOutToUserId;

    @Column(nullable = false)
    private Integer qty = 1;

    @Column(name = "checked_out_at", nullable = false, updatable = false)
    private LocalDateTime checkedOutAt;

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    protected void onCreate() {
        checkedOutAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getComponentId() { return componentId; }
    public void setComponentId(Long componentId) { this.componentId = componentId; }
    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }
    public Integer getCheckedOutToUserId() { return checkedOutToUserId; }
    public void setCheckedOutToUserId(Integer checkedOutToUserId) { this.checkedOutToUserId = checkedOutToUserId; }
    public Integer getQty() { return qty; }
    public void setQty(Integer qty) { this.qty = qty; }
    public LocalDateTime getCheckedOutAt() { return checkedOutAt; }
    public LocalDateTime getCheckedInAt() { return checkedInAt; }
    public void setCheckedInAt(LocalDateTime checkedInAt) { this.checkedInAt = checkedInAt; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
