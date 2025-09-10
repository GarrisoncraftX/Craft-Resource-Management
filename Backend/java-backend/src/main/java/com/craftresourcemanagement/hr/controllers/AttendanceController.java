package com.craftresourcemanagement.hr.controllers;

import com.craftresourcemanagement.hr.entities.User;
import com.craftresourcemanagement.hr.entities.Attendance;
import com.craftresourcemanagement.hr.models.BiometricData;
import com.craftresourcemanagement.hr.services.AttendanceService;
import com.craftresourcemanagement.hr.services.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

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
    public ResponseEntity<?> clockIn(@RequestParam String employeeNumber) {
        Optional<User> userOpt = employeeService.findByEmployeeNumber(employeeNumber);
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
    public ResponseEntity<?> clockOut(@RequestParam String employeeNumber) {
        Optional<User> userOpt = employeeService.findByEmployeeNumber(employeeNumber);
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
    public ResponseEntity<?> biometricClockIn(@RequestParam String employeeNumber, @RequestBody BiometricData biometricData) {
        Optional<User> userOpt = employeeService.findByEmployeeNumber(employeeNumber);
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
    public ResponseEntity<?> biometricClockOut(@RequestParam String employeeNumber, @RequestBody BiometricData biometricData) {
        Optional<User> userOpt = employeeService.findByEmployeeNumber(employeeNumber);
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
}
