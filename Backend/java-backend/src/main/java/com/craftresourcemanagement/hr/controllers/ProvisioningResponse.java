package com.craftresourcemanagement.hr.controllers;

import com.craftresourcemanagement.hr.entities.User;

public class ProvisioningResponse {
    private User user;
    private String message;
    private String employeeId;
    private String temporaryPassword;

    public ProvisioningResponse(User user, String message, String employeeId, String temporaryPassword) {
        this.user = user;
        this.message = message;
        this.employeeId = employeeId;
        this.temporaryPassword = temporaryPassword;
    }

    // Getters and setters
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getTemporaryPassword() {
        return temporaryPassword;
    }

    public void setTemporaryPassword(String temporaryPassword) {
        this.temporaryPassword = temporaryPassword;
    }
}
