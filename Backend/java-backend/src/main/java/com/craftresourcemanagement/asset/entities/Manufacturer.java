package com.craftresourcemanagement.asset.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "manufacturers")
public class Manufacturer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 255)
    private String url;

    @Column(name = "support_url", length = 255)
    private String supportUrl;

    @Column(name = "support_phone", length = 50)
    private String supportPhone;

    @Column(name = "support_email", length = 100)
    private String supportEmail;

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
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getSupportUrl() { return supportUrl; }
    public void setSupportUrl(String supportUrl) { this.supportUrl = supportUrl; }
    public String getSupportPhone() { return supportPhone; }
    public void setSupportPhone(String supportPhone) { this.supportPhone = supportPhone; }
    public String getSupportEmail() { return supportEmail; }
    public void setSupportEmail(String supportEmail) { this.supportEmail = supportEmail; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
