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
    public ResponseEntity<User> updateEmployee(@PathVariable Long id, @RequestBody User user) {
        return employeeService.findById(id)
                .map(existingUser -> {
                    // Merge non-null fields from user to existingUser
                    if (user.getFirstName() != null) existingUser.setFirstName(user.getFirstName());
                    if (user.getLastName() != null) existingUser.setLastName(user.getLastName());
                    if (user.getMiddleName() != null) existingUser.setMiddleName(user.getMiddleName());
                    if (user.getPhone() != null) existingUser.setPhone(user.getPhone());
                    if (user.getAddress() != null) existingUser.setAddress(user.getAddress());
                    if (user.getDateOfBirth() != null) existingUser.setDateOfBirth(user.getDateOfBirth());
                    if (user.getDepartmentId() != null) existingUser.setDepartmentId(user.getDepartmentId());
                    if (user.getRoleId() != null) existingUser.setRoleId(user.getRoleId());
                    if (user.getManagerId() != null) existingUser.setManagerId(user.getManagerId());
                    if (user.getSalary() != null) existingUser.setSalary(user.getSalary());
                    if (user.getAccountNumber() != null) existingUser.setAccountNumber(user.getAccountNumber());
                    if (user.getMomoNumber() != null) existingUser.setMomoNumber(user.getMomoNumber());
                    if (user.getEmergencyContactName() != null) existingUser.setEmergencyContactName(user.getEmergencyContactName());
                    if (user.getEmergencyContactPhone() != null) existingUser.setEmergencyContactPhone(user.getEmergencyContactPhone());
                    if (user.getEmail() != null) existingUser.setEmail(user.getEmail());
                    if (user.getEmployeeId() != null) existingUser.setEmployeeId(user.getEmployeeId());
                    existingUser.setPassword(null);
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
                        existingUser.setPassword(null);
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
