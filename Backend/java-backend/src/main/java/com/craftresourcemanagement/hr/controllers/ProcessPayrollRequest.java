package com.craftresourcemanagement.hr.controllers;

import java.time.LocalDate;

public class ProcessPayrollRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate payDate;
    private Integer departmentId;
    private boolean includeOvertime;
    private boolean includeBonuses;
    private boolean includeDeductions;
    private Long createdBy;

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public LocalDate getPayDate() {
        return payDate;
    }

    public void setPayDate(LocalDate payDate) {
        this.payDate = payDate;
    }

    public Integer getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Integer departmentId) {
        this.departmentId = departmentId;
    }

    public boolean isIncludeOvertime() {
        return includeOvertime;
    }

    public void setIncludeOvertime(boolean includeOvertime) {
        this.includeOvertime = includeOvertime;
    }

    public boolean isIncludeBonuses() {
        return includeBonuses;
    }

    public void setIncludeBonuses(boolean includeBonuses) {
        this.includeBonuses = includeBonuses;
    }

    public boolean isIncludeDeductions() {
        return includeDeductions;
    }

    public void setIncludeDeductions(boolean includeDeductions) {
        this.includeDeductions = includeDeductions;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }
}
