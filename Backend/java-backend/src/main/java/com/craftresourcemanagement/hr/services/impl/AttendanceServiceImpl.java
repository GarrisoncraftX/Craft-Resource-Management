package com.craftresourcemanagement.hr.services.impl;

import com.craftresourcemanagement.hr.entities.Attendance;
import com.craftresourcemanagement.hr.entities.User;
import com.craftresourcemanagement.hr.models.BiometricData;
import com.craftresourcemanagement.hr.repositories.AttendanceRepository;
import com.craftresourcemanagement.hr.services.AttendanceService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;



import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final RestTemplate restTemplate;

    @Value("${python.service.url}")
    private String biometricServiceUrl;

    @Value("${nodejs.service.url}")
    private String nodejsServiceUrl;

    public AttendanceServiceImpl(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public Attendance clockIn(User user) throws IllegalStateException {
        Optional<Attendance> currentAttendance = attendanceRepository.findTopByUserAndClockOutTimeIsNullOrderByClockInTimeDesc(user);
        if (currentAttendance.isPresent()) {
            throw new IllegalStateException("User already clocked in.");
        }
        Attendance attendance = new Attendance();
        attendance.setUser(user);
        attendance.setClockInTime(LocalDateTime.now());
        attendance.setClockInMethod("basic"); // Default method
        return attendanceRepository.save(attendance);
    }

    @Override
    public Attendance clockOut(User user) throws IllegalStateException {
        Optional<Attendance> currentAttendance = attendanceRepository.findTopByUserAndClockOutTimeIsNullOrderByClockInTimeDesc(user);
        if (currentAttendance.isEmpty()) {
            throw new IllegalStateException("User is not clocked in.");
        }
        Attendance attendance = currentAttendance.get();
        attendance.setClockOutTime(LocalDateTime.now());
        attendance.setClockOutMethod("basic"); // Default method
        return attendanceRepository.save(attendance);
    }

    @Override
    public Optional<Attendance> getCurrentAttendance(User user) {
        return attendanceRepository.findTopByUserAndClockOutTimeIsNullOrderByClockInTimeDesc(user);
    }

    @Override
    public Attendance biometricClockIn(User user, BiometricData biometricData) throws IllegalStateException {
        if (!verifyBiometric(user, biometricData)) {
            throw new IllegalStateException("Biometric verification failed.");
        }
        Attendance attendance = clockIn(user);
        attendance.setClockInMethod("biometric");
        return attendanceRepository.save(attendance);
    }

    @Override
    public Attendance biometricClockOut(User user, BiometricData biometricData) throws IllegalStateException {
        if (!verifyBiometric(user, biometricData)) {
            throw new IllegalStateException("Biometric verification failed.");
        }
        Attendance attendance = clockOut(user);
        attendance.setClockOutMethod("biometric");
        return attendanceRepository.save(attendance);
    }

    private boolean verifyBiometric(User user, BiometricData biometricData) {
        String url = biometricServiceUrl + "/api/biometric/verify";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create request body with user info and biometric data
        BiometricVerificationRequest request = new BiometricVerificationRequest(user.getEmployeeId(), biometricData);

        HttpEntity<BiometricVerificationRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<Boolean> response = restTemplate.postForEntity(url, entity, Boolean.class);
            return Boolean.TRUE.equals(response.getBody());
        } catch (Exception e) {
            // Log error if logger is available
            return false;
        }
    }

    private boolean verifyEmployeeCredentials(String employeeId, String password) {
        String url = nodejsServiceUrl + "/api/auth/signin";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create request body for authentication
        CredentialVerificationRequest request = new CredentialVerificationRequest(employeeId, password);

        HttpEntity<CredentialVerificationRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            // Check if response is successful (status 200-299)
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            // Log error if logger is available
            return false;
        }
    }

    @Override
    public List<Attendance> getAttendanceByUser(User user) {
        return attendanceRepository.findByUserOrderByClockInTimeDesc(user);
    }

    // Pillar 2: Fail-Safe Attendance Governance implementations
    @Override
    public Attendance manualClockIn(User user, String employeeId, String password) throws IllegalStateException {
        // Verify employee credentials (use proper authentication)
        if (!verifyEmployeeCredentials(employeeId, password)) {
            throw new IllegalStateException("Invalid employee credentials.");
        }

        Optional<Attendance> currentAttendance = attendanceRepository.findTopByUserAndClockOutTimeIsNullOrderByClockInTimeDesc(user);
        if (currentAttendance.isPresent()) {
            throw new IllegalStateException("User already clocked in.");
        }

        Attendance attendance = new Attendance();
        attendance.setUser(user);
        attendance.setClockInTime(LocalDateTime.now());
        attendance.setClockInMethod("manual");
        attendance.setFlaggedForReview(true);
        attendance.setFlaggedAt(LocalDateTime.now());
        attendance.setAuditNotes("Automatic flag: Manual check-in requires HR review for buddy punching prevention");
        return attendanceRepository.save(attendance);
    }

    @Override
    public Attendance manualClockOut(User user, String employeeId, String password) throws IllegalStateException {
        // Verify employee credentials (use proper authentication)
        if (!verifyEmployeeCredentials(employeeId, password)) {
            throw new IllegalStateException("Invalid employee credentials.");
        }

        Optional<Attendance> currentAttendance = attendanceRepository.findTopByUserAndClockOutTimeIsNullOrderByClockInTimeDesc(user);
        if (currentAttendance.isEmpty()) {
            throw new IllegalStateException("User is not clocked in.");
        }

        Attendance attendance = currentAttendance.get();
        attendance.setClockOutTime(LocalDateTime.now());
        attendance.setClockOutMethod("manual");
        attendance.setFlaggedForReview(true);
        attendance.setFlaggedAt(LocalDateTime.now());
        attendance.setAuditNotes("Automatic flag: Manual check-out requires HR review for buddy punching prevention");
        return attendanceRepository.save(attendance);
    }

    @Override
    public Attendance qrClockIn(User user) throws IllegalStateException {
        Optional<Attendance> currentAttendance = attendanceRepository.findTopByUserAndClockOutTimeIsNullOrderByClockInTimeDesc(user);
        if (currentAttendance.isPresent()) {
            throw new IllegalStateException("User already clocked in.");
        }

        Attendance attendance = new Attendance();
        attendance.setUser(user);
        attendance.setClockInTime(LocalDateTime.now());
        attendance.setClockInMethod("qr");
        return attendanceRepository.save(attendance);
    }

    @Override
    public Attendance qrClockOut(User user) throws IllegalStateException {
        Optional<Attendance> currentAttendance = attendanceRepository.findTopByUserAndClockOutTimeIsNullOrderByClockInTimeDesc(user);
        if (currentAttendance.isEmpty()) {
            throw new IllegalStateException("User is not clocked in.");
        }

        Attendance attendance = currentAttendance.get();
        attendance.setClockOutTime(LocalDateTime.now());
        attendance.setClockOutMethod("qr");
        return attendanceRepository.save(attendance);
    }

    @Override
    public List<Attendance> getManualFallbackAttendances() {
        return attendanceRepository.findByManualFallbackFlagTrue();
    }

    @Override
    public List<Attendance> getAttendancesByMethod(String method) {
        return attendanceRepository.findByClockInMethodOrClockOutMethod(method);
    }

    @Override
    public void flagManualAttendanceForAudit(Long attendanceId, String auditNotes) {
        Optional<Attendance> attendanceOpt = attendanceRepository.findById(attendanceId);
        if (attendanceOpt.isPresent()) {
            Attendance attendance = attendanceOpt.get();
            attendance.setAuditNotes(auditNotes);
            attendanceRepository.save(attendance);
        }
    }

    @Override
    public List<Attendance> getManualFallbacksByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return attendanceRepository.findManualFallbacksByDateRange(startDate, endDate);
    }

    @Override
    public List<Attendance> getUserAttendanceByDateRange(User user, LocalDateTime startDate, LocalDateTime endDate) {
        return attendanceRepository.findUserAttendanceByDateRange(user, startDate, endDate);
    }

    // Pillar 2: HR Dashboard - Buddy Punching Prevention Implementation
    @Override
    public List<Attendance> getPendingReviewAttendances() {
        return attendanceRepository.findPendingReviewAttendances();
    }

    @Override
    public List<Attendance> getRecentManualFallbacks(LocalDateTime since) {
        return attendanceRepository.findRecentManualFallbacks(since);
    }

    @Override
    public Long countUserManualFallbacks(User user, LocalDateTime since) {
        return attendanceRepository.countUserManualFallbacks(user, since);
    }

    @Override
    public void flagAttendanceForReview(Long attendanceId, Long hrUserId, String reason) {
        Optional<Attendance> attendanceOpt = attendanceRepository.findById(attendanceId);
        if (attendanceOpt.isPresent()) {
            Attendance attendance = attendanceOpt.get();
            attendance.setFlaggedForReview(true);
            attendance.setFlaggedAt(LocalDateTime.now());
            attendance.setFlaggedBy(hrUserId);
            attendance.setAuditNotes(reason);
            attendanceRepository.save(attendance);
        }
    }

    @Override
    public void reviewAttendance(Long attendanceId, Long hrUserId, String notes) {
        Optional<Attendance> attendanceOpt = attendanceRepository.findById(attendanceId);
        if (attendanceOpt.isPresent()) {
            Attendance attendance = attendanceOpt.get();
            attendance.setReviewedAt(LocalDateTime.now());
            attendance.setReviewedBy(hrUserId);
            if (notes != null && !notes.isEmpty()) {
                String existingNotes = attendance.getAuditNotes();
                attendance.setAuditNotes(existingNotes != null ? existingNotes + " | Review: " + notes : "Review: " + notes);
            }
            attendanceRepository.save(attendance);
        }
    }

    @Override
    public List<Attendance> getAllAttendances() {
        return attendanceRepository.findAll();
    }

    // Inner class for biometric verification request payload
    @SuppressWarnings("unused")
    private static class BiometricVerificationRequest {
        private String employeeId;
        private BiometricData biometricData;

        public BiometricVerificationRequest(String employeeId, BiometricData biometricData) {
            this.employeeId = employeeId;
            this.biometricData = biometricData;
        }

        public String getEmployeeId() {
            return employeeId;
        }

        public BiometricData getBiometricData() {
            return biometricData;
        }
    }

    // Inner class for credential verification request payload
    @SuppressWarnings("unused")
    private static class CredentialVerificationRequest {
        private String employeeId;
        private String password;

        public CredentialVerificationRequest(String employeeId, String password) {
            this.employeeId = employeeId;
            this.password = password;
        }

        public String getEmployeeId() {
            return employeeId;
        }

        public String getPassword() {
            return password;
        }
    }
}
