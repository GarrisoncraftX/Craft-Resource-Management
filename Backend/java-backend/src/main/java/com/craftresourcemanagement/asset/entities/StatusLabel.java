package com.craftresourcemanagement.asset.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "status_labels")
public class StatusLabel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "status_type", nullable = false)
    private String statusType = "deployable";

    @Column(length = 10)
    private String color;

    @Column(name = "show_in_nav")
    private Boolean showInNav = true;

    @Column(name = "default_label")
    private Boolean defaultLabel = false;

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
    public String getStatusType() { return statusType; }
    public void setStatusType(String statusType) { this.statusType = statusType; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public Boolean getShowInNav() { return showInNav; }
    public void setShowInNav(Boolean showInNav) { this.showInNav = showInNav; }
    public Boolean getDefaultLabel() { return defaultLabel; }
    public void setDefaultLabel(Boolean defaultLabel) { this.defaultLabel = defaultLabel; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
