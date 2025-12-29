package com.craftresourcemanagement.hr.controllers;

import com.craftresourcemanagement.hr.entities.User;
import com.craftresourcemanagement.hr.entities.Attendance;
import com.craftresourcemanagement.hr.models.BiometricData;
import com.craftresourcemanagement.hr.services.AttendanceService;
import com.craftresourcemanagement.hr.services.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final EmployeeService employeeService;

    public AttendanceController(AttendanceService attendanceService, EmployeeService employeeService) {
        this.attendanceService = attendanceService;
        this.employeeService = employeeService;
    }

    @PostMapping("/clock-in")
    public ResponseEntity<?> clockIn(@RequestParam String employeeId) {
        Optional<User> userOpt = employeeService.findByEmployeeId(employeeId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid employee number");
        }
        try {
            Attendance attendance = attendanceService.clockIn(userOpt.get());
            return ResponseEntity.ok(attendance);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/clock-out")
    public ResponseEntity<?> clockOut(@RequestParam String employeeId) {
        Optional<User> userOpt = employeeService.findByEmployeeId(employeeId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid employee number");
        }
        try {
            Attendance attendance = attendanceService.clockOut(userOpt.get());
            return ResponseEntity.ok(attendance);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/biometric-clock-in")
    public ResponseEntity<?> biometricClockIn(@RequestParam String employeeId, @RequestBody BiometricData biometricData) {
        Optional<User> userOpt = employeeService.findByEmployeeId(employeeId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid employee number");
        }
        try {
            Attendance attendance = attendanceService.biometricClockIn(userOpt.get(), biometricData);
            return ResponseEntity.ok(attendance);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/biometric-clock-out")
    public ResponseEntity<?> biometricClockOut(@RequestParam String employeeId, @RequestBody BiometricData biometricData) {
        Optional<User> userOpt = employeeService.findByEmployeeId(employeeId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid employee number");
        }
        try {
            Attendance attendance = attendanceService.biometricClockOut(userOpt.get(), biometricData);
            return ResponseEntity.ok(attendance);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getAttendanceByUser(@PathVariable Long userId) {
        Optional<User> userOpt = employeeService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid user ID");
        }
        try {
            List<Attendance> attendances = attendanceService.getAttendanceByUser(userOpt.get());
            return ResponseEntity.ok(attendances);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching attendance records");
        }
    }
}
