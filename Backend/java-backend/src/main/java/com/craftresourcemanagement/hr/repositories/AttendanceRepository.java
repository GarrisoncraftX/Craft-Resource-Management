package com.craftresourcemanagement.hr.repositories;

import com.craftresourcemanagement.hr.entities.Attendance;
import com.craftresourcemanagement.hr.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findTopByUserAndClockOutTimeIsNullOrderByClockInTimeDesc(User user);
    List<Attendance> findByUserOrderByClockInTimeDesc(User user);

    // Pillar 2: Fail-Safe Attendance Governance queries
    @Query("SELECT a FROM Attendance a WHERE a.manualFallbackFlag = true ORDER BY a.clockInTime DESC")
    List<Attendance> findByManualFallbackFlagTrue();

    @Query("SELECT a FROM Attendance a WHERE a.clockInMethod = ?1 OR a.clockOutMethod = ?1 ORDER BY a.clockInTime DESC")
    List<Attendance> findByClockInMethodOrClockOutMethod(String method);

    @Query("SELECT a FROM Attendance a WHERE a.clockInMethod = 'manual' OR a.clockOutMethod = 'manual' ORDER BY a.clockInTime DESC")
    List<Attendance> findManualAttendancesForAudit();

    @Query("SELECT a FROM Attendance a WHERE a.clockInTime >= ?1 AND a.clockInTime <= ?2 AND a.manualFallbackFlag = true ORDER BY a.clockInTime DESC")
    List<Attendance> findManualFallbacksByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT a FROM Attendance a WHERE a.user = ?1 AND a.clockInTime >= ?2 AND a.clockInTime <= ?3 ORDER BY a.clockInTime DESC")
    List<Attendance> findUserAttendanceByDateRange(User user, LocalDateTime startDate, LocalDateTime endDate);

    // Pillar 2: HR Dashboard queries for buddy punching prevention
    @Query("SELECT a FROM Attendance a WHERE a.flaggedForReview = true AND a.reviewedAt IS NULL ORDER BY a.flaggedAt DESC")
    List<Attendance> findPendingReviewAttendances();

    @Query("SELECT a FROM Attendance a WHERE a.manualFallbackFlag = true AND a.clockInTime >= ?1 ORDER BY a.clockInTime DESC")
    List<Attendance> findRecentManualFallbacks(LocalDateTime since);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.user = ?1 AND a.manualFallbackFlag = true AND a.clockInTime >= ?2")
    Long countUserManualFallbacks(User user, LocalDateTime since);
}
