package com.craftresourcemanagement.hr.services;

import com.craftresourcemanagement.hr.entities.EmployeeTraining;
import com.craftresourcemanagement.hr.entities.User;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface EmployeeService {
    User registerEmployee(User user);
    List<User> listAllEmployees();
    List<User> getFilteredUsers(String filter, Integer departmentId, Integer roleId);
    Map<String, Long> getPeopleCounts();
    Optional<User> findByEmployeeId(String employeeId);
    Optional<User> findById(Long id);
    List<User> getProvisionedEmployees();
    User toggleUserStatus(Long id);
    
    // Automated workflow methods
    List<User> getEmployeesWithBirthdayToday();
    List<User> getEmployeesWithAnniversaryToday();
    List<User> getEmployeesWithProbationEndingOn(LocalDate date);
    List<User> getEmployeesWithContractExpiringOn(LocalDate date);
    List<EmployeeTraining> getTrainingsEndingOn(LocalDate date);
    List<User> getEmployeesWithLowLeaveBalance(int threshold);
    void autoSchedulePerformanceReviews();
}
