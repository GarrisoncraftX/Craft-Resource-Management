package com.craftresourcemanagement.hr.repositories;

import com.craftresourcemanagement.hr.entities.Attendance;
import com.craftresourcemanagement.hr.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findTopByUserAndClockOutTimeIsNullOrderByClockInTimeDesc(User user);
    List<Attendance> findByUserOrderByClockInTimeDesc(User user);
}
