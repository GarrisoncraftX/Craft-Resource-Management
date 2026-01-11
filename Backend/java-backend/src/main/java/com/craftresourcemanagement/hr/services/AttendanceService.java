package com.craftresourcemanagement.hr.services;

import com.craftresourcemanagement.hr.entities.Attendance;
import com.craftresourcemanagement.hr.entities.User;
import com.craftresourcemanagement.hr.models.BiometricData;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AttendanceService {
    Attendance clockIn(User user) throws IllegalStateException;
    Attendance clockOut(User user) throws IllegalStateException;
    Optional<Attendance> getCurrentAttendance(User user);

    Attendance biometricClockIn(User user, BiometricData biometricData) throws IllegalStateException;
    Attendance biometricClockOut(User user, BiometricData biometricData) throws IllegalStateException;

    // Pillar 2: Fail-Safe Attendance Governance methods
    Attendance manualClockIn(User user, String employeeId, String password) throws IllegalStateException;
    Attendance manualClockOut(User user, String employeeId, String password) throws IllegalStateException;
    Attendance qrClockIn(User user) throws IllegalStateException;
    Attendance qrClockOut(User user) throws IllegalStateException;

    List<Attendance> getAttendanceByUser(User user);

    // Pillar 2: HR Dashboard methods for monitoring attendance methods
    List<Attendance> getManualFallbackAttendances(); // Get attendances flagged for manual fallback
    List<Attendance> getAttendancesByMethod(String method); // Get attendances by specific method
    void flagManualAttendanceForAudit(Long attendanceId, String auditNotes); // HR audit flagging
    List<Attendance> getManualFallbacksByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    List<Attendance> getUserAttendanceByDateRange(User user, LocalDateTime startDate, LocalDateTime endDate);

    // Pillar 2: HR Dashboard - Buddy Punching Prevention
    List<Attendance> getPendingReviewAttendances(); // Get all flagged attendances pending review
    List<Attendance> getRecentManualFallbacks(LocalDateTime since); // Get recent manual check-ins
    Long countUserManualFallbacks(User user, LocalDateTime since); // Count user's manual fallbacks
    void flagAttendanceForReview(Long attendanceId, Long hrUserId, String reason); // Flag for buddy punch review
    void reviewAttendance(Long attendanceId, Long hrUserId, String notes); // Mark as reviewed
    List<Attendance> getAllAttendances();
}
