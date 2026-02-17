package com.craftresourcemanagement.hr.controllers;

import com.craftresourcemanagement.hr.entities.User;
import com.craftresourcemanagement.hr.services.EmployeeService;
import com.craftresourcemanagement.hr.services.CloudinaryService;
import com.craftresourcemanagement.hr.services.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/hr/employees")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final CloudinaryService cloudinaryService;
    private final NotificationService notificationService;

    public EmployeeController(EmployeeService employeeService, CloudinaryService cloudinaryService, NotificationService notificationService) {
        this.employeeService = employeeService;
        this.cloudinaryService = cloudinaryService;
        this.notificationService = notificationService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerEmployee(@RequestBody User user) {
        try {
            User savedUser = employeeService.registerEmployee(user);

            // Pillar 1: Return provisioning information for new employees
            if (user.getId() == null) {
                return ResponseEntity.ok(new ProvisioningResponse(
                    savedUser,
                    "Employee provisioned successfully. Temporary Key: " + savedUser.getEmployeeId() + " + CRMSemp123!",
                    savedUser.getEmployeeId(),
                    savedUser.getTemporaryPassword()
                ));
            } else {
                return ResponseEntity.ok(savedUser);
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<User>> listEmployees(
            @RequestParam(required = false) String filter,
            @RequestParam(required = false) Integer departmentId,
            @RequestParam(required = false) Integer roleId) {
        try {
            List<User> employees;
            if (filter != null) {
                employees = employeeService.getFilteredUsers(filter, departmentId, roleId);
            } else {
                employees = employeeService.listAllEmployees();
            }
            return ResponseEntity.ok(employees);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/counts")
    public ResponseEntity<Map<String, Long>> getPeopleCounts() {
        return ResponseEntity.ok(employeeService.getPeopleCounts());
    }

    @GetMapping("/provisioned")
    public ResponseEntity<?> getProvisionedEmployees() {
        try {
            List<User> provisionedEmployees = employeeService.getProvisionedEmployees();
            return ResponseEntity.ok(new ProvisionedEmployeesResponse(provisionedEmployees));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to fetch provisioned employees: " + e.getMessage());
        }
    }

  

    @GetMapping("/id/{id}")
    public ResponseEntity<User> getEmployeeById(@PathVariable Long id) {
        return employeeService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/id/{id}")
    public ResponseEntity<User> updateEmployee(@PathVariable Long id, @RequestBody UpdateEmployeeRequest request) {
        // Only validate password if it's actually being changed (not empty and not already hashed)
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            // Check if password is already hashed (bcrypt starts with $2a$ or $2b$)
            if (!request.getPassword().startsWith("$2a$") && !request.getPassword().startsWith("$2b$")) {
                if (!request.getPassword().equals(request.getConfirmPassword())) {
                    return ResponseEntity.badRequest().build();
                }
            }
        }
        return employeeService.findById(id)
                .map(existingUser -> {
                    if (request.getFirstName() != null) existingUser.setFirstName(request.getFirstName());
                    if (request.getLastName() != null) existingUser.setLastName(request.getLastName());
                    if (request.getMiddleName() != null) existingUser.setMiddleName(request.getMiddleName());
                    if (request.getPhone() != null) existingUser.setPhone(request.getPhone());
                    if (request.getAddress() != null) existingUser.setAddress(request.getAddress());
                    if (request.getDateOfBirth() != null) existingUser.setDateOfBirth(request.getDateOfBirth());
                    if (request.getDepartmentId() != null) existingUser.setDepartmentId(request.getDepartmentId());
                    if (request.getRoleId() != null) existingUser.setRoleId(request.getRoleId());
                    if (request.getManagerId() != null) existingUser.setManagerId(request.getManagerId());
                    if (request.getSalary() != null) existingUser.setSalary(request.getSalary());
                    if (request.getAccountNumber() != null) existingUser.setAccountNumber(request.getAccountNumber());
                    if (request.getMomoNumber() != null) existingUser.setMomoNumber(request.getMomoNumber());
                    if (request.getBankName() != null) existingUser.setBankName(request.getBankName());
                    if (request.getEmergencyContactName() != null) existingUser.setEmergencyContactName(request.getEmergencyContactName());
                    if (request.getEmergencyContactPhone() != null) existingUser.setEmergencyContactPhone(request.getEmergencyContactPhone());
                    if (request.getEmail() != null) existingUser.setEmail(request.getEmail());
                    if (request.getEmployeeId() != null) existingUser.setEmployeeId(request.getEmployeeId());
                    // Only set password if it's provided, not empty, and not already hashed
                    if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
                        if (!request.getPassword().startsWith("$2a$") && !request.getPassword().startsWith("$2b$")) {
                            existingUser.setPassword(request.getPassword());
                        }
                        // If password is already hashed, don't set it (preserve existing)
                    }
                    if (request.getProfileCompleted() != null) existingUser.setProfileCompleted(request.getProfileCompleted());
                    if (request.getDefaultPasswordChanged() != null) existingUser.setDefaultPasswordChanged(request.getDefaultPasswordChanged());
                    
                    // Preserve hireDate if null to avoid constraint violation
                    if (existingUser.getHireDate() == null) {
                        existingUser.setHireDate(java.time.LocalDate.now());
                    }
                    
                    User updatedUser = employeeService.registerEmployee(existingUser);
                    return ResponseEntity.ok(updatedUser);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/id/{id}/profile-picture")
    public ResponseEntity<?> updateProfilePicture(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        // Validate file
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is required and cannot be empty");
        }
        if (file.getSize() > 5 * 1024 * 1024) { // 5MB limit
            return ResponseEntity.badRequest().body("File size must be less than 5MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body("File must be an image");
        }

        return employeeService.findById(id)
                .map(existingUser -> {
                    try {
                        String imageUrl = cloudinaryService.uploadImage(file);
                        existingUser.setProfilePictureUrl(imageUrl);
                        User updatedUser = employeeService.registerEmployee(existingUser);
                        return ResponseEntity.ok(updatedUser);
                    } catch (IOException e) {
                        e.printStackTrace();
                        return ResponseEntity.status(500).body("Failed to upload image: " + e.getMessage());
                    } catch (Exception e) {
                        e.printStackTrace();
                        return ResponseEntity.status(500).body("Unexpected error during image upload: " + e.getMessage());
                    }
                })
                .orElse(ResponseEntity.status(404).body("Employee not found"));
    }

    @PutMapping("/id/{id}/toggle-status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(employeeService.toggleUserStatus(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/test-birthday-notifications")
    public ResponseEntity<?> testBirthdayNotifications() {
        try {
            List<User> birthdayEmployees = employeeService.getEmployeesWithBirthdayToday();
            List<User> anniversaryEmployees = employeeService.getEmployeesWithAnniversaryToday();
            
            birthdayEmployees.forEach(notificationService::sendBirthdayGreeting);
            anniversaryEmployees.forEach(notificationService::sendAnniversaryGreeting);
            
            Map<String, Object> response = new HashMap<>();
            response.put("birthdayCount", birthdayEmployees.size());
            response.put("anniversaryCount", anniversaryEmployees.size());
            response.put("birthdayEmployees", birthdayEmployees.stream().map(u -> u.getFirstName() + " " + u.getLastName()).toList());
            response.put("anniversaryEmployees", anniversaryEmployees.stream().map(u -> u.getFirstName() + " " + u.getLastName()).toList());
            response.put("message", "Notifications sent successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
