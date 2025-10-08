package com.craftresourcemanagement.hr.controllers;

import com.craftresourcemanagement.hr.entities.User;
import com.craftresourcemanagement.hr.services.EmployeeService;
import com.craftresourcemanagement.hr.services.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/hr/employees")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final CloudinaryService cloudinaryService;

    public EmployeeController(EmployeeService employeeService, CloudinaryService cloudinaryService) {
        this.employeeService = employeeService;
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerEmployee(@RequestBody User user) {
        User savedUser = employeeService.registerEmployee(user);
        return ResponseEntity.ok(savedUser);
    }

    @GetMapping("/list")
    public ResponseEntity<List<User>> listEmployees() {
        try {
            List<User> employees = employeeService.listAllEmployees();
            return ResponseEntity.ok(employees);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
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
        if (request.getPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().build();
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
                    if (request.getEmergencyContactName() != null) existingUser.setEmergencyContactName(request.getEmergencyContactName());
                    if (request.getEmergencyContactPhone() != null) existingUser.setEmergencyContactPhone(request.getEmergencyContactPhone());
                    if (request.getEmail() != null) existingUser.setEmail(request.getEmail());
                    if (request.getEmployeeId() != null) existingUser.setEmployeeId(request.getEmployeeId());
                    if (request.getPassword() != null) {
                        existingUser.setPassword(request.getPassword());
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
                        return ResponseEntity.status(500).body("Failed to upload image: " + e.getMessage());
                    } catch (Exception e) {
                        return ResponseEntity.status(500).body("Unexpected error during image upload: " + e.getMessage());
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
