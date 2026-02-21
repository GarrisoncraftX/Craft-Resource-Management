package com.craftresourcemanagement.asset.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "category_type", nullable = false)
    private String categoryType = "asset";

    @Column(name = "eula_text", columnDefinition = "TEXT")
    private String eulaText;

    @Column(name = "use_default_eula")
    private Boolean useDefaultEula = false;

    @Column(name = "require_acceptance")
    private Boolean requireAcceptance = false;

    @Column(name = "checkin_email")
    private Boolean checkinEmail = false;

    @Column(length = 255)
    private String image;

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
    public String getCategoryType() { return categoryType; }
    public void setCategoryType(String categoryType) { this.categoryType = categoryType; }
    public String getEulaText() { return eulaText; }
    public void setEulaText(String eulaText) { this.eulaText = eulaText; }
    public Boolean getUseDefaultEula() { return useDefaultEula; }
    public void setUseDefaultEula(Boolean useDefaultEula) { this.useDefaultEula = useDefaultEula; }
    public Boolean getRequireAcceptance() { return requireAcceptance; }
    public void setRequireAcceptance(Boolean requireAcceptance) { this.requireAcceptance = requireAcceptance; }
    public Boolean getCheckinEmail() { return checkinEmail; }
    public void setCheckinEmail(Boolean checkinEmail) { this.checkinEmail = checkinEmail; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
