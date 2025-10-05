package com.craftresourcemanagement.hr.controllers;

import com.craftresourcemanagement.hr.entities.User;
import com.craftresourcemanagement.hr.services.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hr/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
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
                    user.setId(existingUser.getId());
                    User updatedUser = employeeService.registerEmployee(user);
                    return ResponseEntity.ok(updatedUser);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
