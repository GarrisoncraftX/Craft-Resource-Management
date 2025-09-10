package com.craftresourcemanagement.hr.services;

import com.craftresourcemanagement.hr.entities.Attendance;
import com.craftresourcemanagement.hr.entities.User;
import com.craftresourcemanagement.hr.models.BiometricData;

import java.util.Optional;

public interface AttendanceService {
    Attendance clockIn(User user) throws IllegalStateException;
    Attendance clockOut(User user) throws IllegalStateException;
    Optional<Attendance> getCurrentAttendance(User user);

    Attendance biometricClockIn(User user, BiometricData biometricData) throws IllegalStateException;
    Attendance biometricClockOut(User user, BiometricData biometricData) throws IllegalStateException;
}
