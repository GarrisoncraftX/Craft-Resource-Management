package com.craftresourcemanagement.hr.controllers;

import com.craftresourcemanagement.hr.entities.User;
import java.util.List;

public class ProvisionedEmployeesResponse {
    private List<User> employees;

    public ProvisionedEmployeesResponse(List<User> employees) {
        this.employees = employees;
    }

    public List<User> getEmployees() {
        return employees;
    }

    public void setEmployees(List<User> employees) {
        this.employees = employees;
    }
}
