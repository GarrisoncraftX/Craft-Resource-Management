package com.craftresourcemanagement.hr.controllers;

public class ProcessPayrollResponse {
    private Long payrollRunId;
    private int employeesProcessed;
    private String status;
    private String message;

    public ProcessPayrollResponse(Long payrollRunId, int employeesProcessed, String status, String message) {
        this.payrollRunId = payrollRunId;
        this.employeesProcessed = employeesProcessed;
        this.status = status;
        this.message = message;
    }

    public Long getPayrollRunId() {
        return payrollRunId;
    }

    public void setPayrollRunId(Long payrollRunId) {
        this.payrollRunId = payrollRunId;
    }

    public int getEmployeesProcessed() {
        return employeesProcessed;
    }

    public void setEmployeesProcessed(int employeesProcessed) {
        this.employeesProcessed = employeesProcessed;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
