package com.craftresourcemanagement.system.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "active_sessions")
public class ActiveSession {
    @Id
    private String sessionId;
    private Integer userId;
    private String service;
    private LocalDateTime startTime;
    private LocalDateTime lastActivity;

    @Transient
    private String firstName;
    @Transient
    private String lastName;

    @PrePersist
    protected void onCreate() {
        if (startTime == null) startTime = LocalDateTime.now();
        lastActivity = LocalDateTime.now();
    }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public String getService() { return service; }
    public void setService(String service) { this.service = service; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getLastActivity() { return lastActivity; }
    public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
}
