package com.craftresourcemanagement;

import com.craftresourcemanagement.hr.entities.Attendance;
import com.craftresourcemanagement.hr.entities.User;
import com.craftresourcemanagement.hr.repositories.AttendanceRepository;
import com.craftresourcemanagement.hr.services.impl.AttendanceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @InjectMocks
    private AttendanceServiceImpl attendanceService;

    private Attendance testAttendance;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmployeeId("EMP001");
        
        testAttendance = new Attendance();
        testAttendance.setUser(testUser);
        testAttendance.setClockInTime(LocalDateTime.now());
        testAttendance.setStatus("present");
    }

    @Test
    void testClockIn_Success() {
        when(attendanceRepository.findTopByUserAndClockOutTimeIsNullOrderByClockInTimeDesc(any(User.class)))
            .thenReturn(Optional.empty());
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(testAttendance);

        Attendance result = attendanceService.clockIn(testUser);

        assertNotNull(result);
        assertNotNull(result.getClockInTime());
        verify(attendanceRepository, times(1)).save(any(Attendance.class));
    }

    @Test
    void testClockOut_Success() {
        when(attendanceRepository.findTopByUserAndClockOutTimeIsNullOrderByClockInTimeDesc(any(User.class)))
            .thenReturn(Optional.of(testAttendance));
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(testAttendance);

        Attendance result = attendanceService.clockOut(testUser);

        assertNotNull(result.getClockOutTime());
        verify(attendanceRepository, times(1)).save(any(Attendance.class));
    }

    @Test
    void testGetUserAttendance_Success() {
        List<Attendance> mockAttendance = Arrays.asList(testAttendance);
        when(attendanceRepository.findByUserOrderByClockInTimeDesc(any(User.class))).thenReturn(mockAttendance);

        List<Attendance> result = attendanceService.getAttendanceByUser(testUser);

        assertEquals(1, result.size());
    }


}
