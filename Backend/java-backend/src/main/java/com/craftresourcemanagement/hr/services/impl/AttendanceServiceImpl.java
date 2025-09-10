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
import java.util.Optional;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final RestTemplate restTemplate;

    @Value("${python.service.url}")
    private String biometricServiceUrl;

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
        return clockIn(user);
    }

    @Override
    public Attendance biometricClockOut(User user, BiometricData biometricData) throws IllegalStateException {
        if (!verifyBiometric(user, biometricData)) {
            throw new IllegalStateException("Biometric verification failed.");
        }
        return clockOut(user);
    }

    private boolean verifyBiometric(User user, BiometricData biometricData) {
        String url = biometricServiceUrl + "/biometrics/verify";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create request body with user info and biometric data
        BiometricVerificationRequest request = new BiometricVerificationRequest(user.getEmployeeNumber(), biometricData);

        HttpEntity<BiometricVerificationRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<Boolean> response = restTemplate.postForEntity(url, entity, Boolean.class);
            return Boolean.TRUE.equals(response.getBody());
        } catch (Exception e) {
            // Log error if logger is available
            return false;
        }
    }

    // Inner class for biometric verification request payload
    @SuppressWarnings("unused")
    private static class BiometricVerificationRequest {
        private String employeeNumber;
        private BiometricData biometricData;

        public BiometricVerificationRequest(String employeeNumber, BiometricData biometricData) {
            this.employeeNumber = employeeNumber;
            this.biometricData = biometricData;
        }

        public String getEmployeeNumber() {
            return employeeNumber;
        }

        public BiometricData getBiometricData() {
            return biometricData;
        }
    }
}
