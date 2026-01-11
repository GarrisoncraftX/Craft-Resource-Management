package com.craftresourcemanagement.hr.controllers;

import com.craftresourcemanagement.hr.entities.User;
import com.craftresourcemanagement.hr.entities.Attendance;
import com.craftresourcemanagement.hr.models.BiometricData;
import com.craftresourcemanagement.hr.services.AttendanceService;
import com.craftresourcemanagement.hr.services.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

    // Pillar 2: Fail-Safe Attendance Governance endpoints
    @PostMapping("/manual-clock-in")
    public ResponseEntity<?> manualClockIn(@RequestParam String employeeId, @RequestParam String password) {
        Optional<User> userOpt = employeeService.findByEmployeeId(employeeId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid employee number");
        }
        try {
            Attendance attendance = attendanceService.manualClockIn(userOpt.get(), employeeId, password);
            return ResponseEntity.ok(attendance);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/manual-clock-out")
    public ResponseEntity<?> manualClockOut(@RequestParam String employeeId, @RequestParam String password) {
        Optional<User> userOpt = employeeService.findByEmployeeId(employeeId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid employee number");
        }
        try {
            Attendance attendance = attendanceService.manualClockOut(userOpt.get(), employeeId, password);
            return ResponseEntity.ok(attendance);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/qr-clock-in")
    public ResponseEntity<?> qrClockIn(@RequestParam String employeeId) {
        Optional<User> userOpt = employeeService.findByEmployeeId(employeeId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid employee number");
        }
        try {
            Attendance attendance = attendanceService.qrClockIn(userOpt.get());
            return ResponseEntity.ok(attendance);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/qr-clock-out")
    public ResponseEntity<?> qrClockOut(@RequestParam String employeeId) {
        Optional<User> userOpt = employeeService.findByEmployeeId(employeeId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid employee number");
        }
        try {
            Attendance attendance = attendanceService.qrClockOut(userOpt.get());
            return ResponseEntity.ok(attendance);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Pillar 2: HR Dashboard monitoring endpoints
    @GetMapping("/manual-fallbacks")
    public ResponseEntity<?> getManualFallbackAttendances() {
        try {
            List<Attendance> attendances = attendanceService.getManualFallbackAttendances();
            return ResponseEntity.ok(attendances);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching manual fallback attendances");
        }
    }

    @GetMapping("/by-method/{method}")
    public ResponseEntity<?> getAttendancesByMethod(@PathVariable String method) {
        try {
            List<Attendance> attendances = attendanceService.getAttendancesByMethod(method);
            return ResponseEntity.ok(attendances);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching attendances by method");
        }
    }

    @PostMapping("/{attendanceId}/flag-audit")
    public ResponseEntity<?> flagAttendanceForAudit(@PathVariable Long attendanceId, @RequestBody Map<String, String> request) {
        try {
            String auditNotes = request.get("auditNotes");
            attendanceService.flagManualAttendanceForAudit(attendanceId, auditNotes);
            return ResponseEntity.ok("Attendance flagged for audit successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error flagging attendance for audit");
        }
    }

    @GetMapping("/manual-fallbacks/date-range")
    public ResponseEntity<?> getManualFallbacksByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);
            List<Attendance> attendances = attendanceService.getManualFallbacksByDateRange(start, end);
            return ResponseEntity.ok(attendances);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching manual fallbacks by date range");
        }
    }

    @GetMapping("/user/{userId}/date-range")
    public ResponseEntity<?> getUserAttendanceByDateRange(
            @PathVariable Long userId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        Optional<User> userOpt = employeeService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid user ID");
        }
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);
            List<Attendance> attendances = attendanceService.getUserAttendanceByDateRange(userOpt.get(), start, end);
            return ResponseEntity.ok(attendances);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching user attendance by date range");
        }
    }

    @GetMapping("/buddy-punch-report")
    public ResponseEntity<?> getBuddyPunchReport() {
        try {
            List<Attendance> manualAttendances = attendanceService.getManualFallbackAttendances();
            Map<String, Object> report = new HashMap<>();
            report.put("totalManualEntries", manualAttendances.size());
            report.put("flaggedAttendances", manualAttendances);
            report.put("reportGeneratedAt", LocalDateTime.now());
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error generating buddy punch report");
        }
    }

    @PostMapping("/{attendanceId}/buddy-punch-flag")
    public ResponseEntity<?> flagBuddyPunchRisk(
            @PathVariable Long attendanceId,
            @RequestBody Map<String, String> request) {
        try {
            String reason = request.get("reason");
            attendanceService.flagManualAttendanceForAudit(attendanceId, reason);
            return ResponseEntity.ok("Attendance flagged for buddy punch review");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error flagging attendance");
        }
    }

    @GetMapping("/method-statistics")
    public ResponseEntity<?> getAttendanceMethodStatistics() {
        try {
            List<Attendance> qrAttendances = attendanceService.getAttendancesByMethod("qr");
            List<Attendance> manualAttendances = attendanceService.getAttendancesByMethod("manual");
            List<Attendance> biometricAttendances = attendanceService.getAttendancesByMethod("biometric");
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("qrCount", qrAttendances.size());
            stats.put("manualCount", manualAttendances.size());
            stats.put("biometricCount", biometricAttendances.size());
            stats.put("totalAttendances", qrAttendances.size() + manualAttendances.size() + biometricAttendances.size());
            stats.put("manualPercentage", manualAttendances.size() > 0 ? 
                (manualAttendances.size() * 100.0) / (qrAttendances.size() + manualAttendances.size() + biometricAttendances.size()) : 0);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching attendance method statistics");
        }
    }

    // Pillar 2: HR Dashboard - Buddy Punching Prevention Endpoints
    @GetMapping("/pending-review")
    public ResponseEntity<?> getPendingReviewAttendances() {
        try {
            List<Attendance> attendances = attendanceService.getPendingReviewAttendances();
            return ResponseEntity.ok(attendances);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching pending review attendances");
        }
    }

    @GetMapping("/recent-manual-fallbacks")
    public ResponseEntity<?> getRecentManualFallbacks(@RequestParam(defaultValue = "7") int days) {
        try {
            LocalDateTime since = LocalDateTime.now().minusDays(days);
            List<Attendance> attendances = attendanceService.getRecentManualFallbacks(since);
            return ResponseEntity.ok(attendances);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching recent manual fallbacks");
        }
    }

    @GetMapping("/user/{userId}/manual-fallback-count")
    public ResponseEntity<?> getUserManualFallbackCount(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "30") int days) {
        Optional<User> userOpt = employeeService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid user ID");
        }
        try {
            LocalDateTime since = LocalDateTime.now().minusDays(days);
            Long count = attendanceService.countUserManualFallbacks(userOpt.get(), since);
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("days", days);
            response.put("manualFallbackCount", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error counting user manual fallbacks");
        }
    }

    @PostMapping("/{attendanceId}/flag-for-review")
    public ResponseEntity<?> flagAttendanceForReview(
            @PathVariable Long attendanceId,
            @RequestBody Map<String, Object> request) {
        try {
            Long hrUserId = Long.valueOf(request.get("hrUserId").toString());
            String reason = request.get("reason").toString();
            attendanceService.flagAttendanceForReview(attendanceId, hrUserId, reason);
            return ResponseEntity.ok("Attendance flagged for review successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error flagging attendance for review");
        }
    }

    @PostMapping("/{attendanceId}/review")
    public ResponseEntity<?> reviewAttendance(
            @PathVariable Long attendanceId,
            @RequestBody Map<String, Object> request) {
        try {
            Long hrUserId = Long.valueOf(request.get("hrUserId").toString());
            String notes = request.getOrDefault("notes", "").toString();
            attendanceService.reviewAttendance(attendanceId, hrUserId, notes);
            return ResponseEntity.ok("Attendance reviewed successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error reviewing attendance");
        }
    }

    @GetMapping("/hr-dashboard-summary")
    public ResponseEntity<?> getHRDashboardSummary() {
        try {
            LocalDateTime last7Days = LocalDateTime.now().minusDays(7);
            LocalDateTime last30Days = LocalDateTime.now().minusDays(30);
            
            List<Attendance> pendingReview = attendanceService.getPendingReviewAttendances();
            List<Attendance> recentManual = attendanceService.getRecentManualFallbacks(last7Days);
            List<Attendance> manualLast30Days = attendanceService.getManualFallbacksByDateRange(last30Days, LocalDateTime.now());
            
            Map<String, Object> summary = new HashMap<>();
            summary.put("pendingReviewCount", pendingReview.size());
            summary.put("recentManualFallbacks7Days", recentManual.size());
            summary.put("manualFallbacks30Days", manualLast30Days.size());
            summary.put("pendingReviewList", pendingReview);
            summary.put("generatedAt", LocalDateTime.now());
            
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error generating HR dashboard summary");
        }
    }
}
