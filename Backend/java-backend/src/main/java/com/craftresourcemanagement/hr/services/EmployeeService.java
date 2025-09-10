package com.craftresourcemanagement.hr.services;

import com.craftresourcemanagement.hr.entities.User;

import java.util.List;
import java.util.Optional;

public interface EmployeeService {
    User registerEmployee(User user);
    List<User> listAllEmployees();
    Optional<User> findByEmployeeNumber(String employeeNumber);
}
