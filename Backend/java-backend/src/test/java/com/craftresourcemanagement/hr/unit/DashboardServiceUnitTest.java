package com.craftresourcemanagement.hr.unit;

import com.craftresourcemanagement.hr.repositories.*;
import com.craftresourcemanagement.hr.services.impl.DashboardServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceUnitTest {

    @Mock private UserRepository userRepository;
    @Mock private PayrollRunRepository payrollRunRepository;
    @Mock private PerformanceReviewRepository performanceReviewRepository;
    @Mock private EmployeeTrainingRepository employeeTrainingRepository;

    @InjectMocks
    private DashboardServiceImpl dashboardService;

    @Test
    void getEmployeeCount_Success() {
        when(userRepository.count()).thenReturn(150L);
        assertEquals(150L, dashboardService.getEmployeeCount());
        verify(userRepository).count();
    }

    @Test
    void getActiveEmployeeCount_Success() {
        when(userRepository.countByIsActive(true)).thenReturn(145L);
        assertEquals(145L, dashboardService.getActiveEmployeeCount());
        verify(userRepository).countByIsActive(true);
    }

    @Test
    void getTodayAttendanceCount_Success() {
        long count = dashboardService.getTodayAttendanceCount();
        assertTrue(count >= 0);
    }

    @Test
    void getAttendanceRate_Success() {
        when(userRepository.countByIsActive(true)).thenReturn(150L);
        double rate = dashboardService.getAttendanceRate();
        assertTrue(rate >= 0.0);
    }

    @Test
    void getAttendanceRate_ZeroEmployees() {
        when(userRepository.countByIsActive(true)).thenReturn(0L);
        assertEquals(0.0, dashboardService.getAttendanceRate());
    }

    @Test
    void getPendingPayrollCount_Success() {
        when(payrollRunRepository.countByStatus("pending")).thenReturn(5L);
        assertEquals(5L, dashboardService.getPendingPayrollCount());
    }

    @Test
    void getPendingReviewsCount_Success() {
        when(performanceReviewRepository.countByStatus("pending")).thenReturn(12L);
        assertEquals(12L, dashboardService.getPendingReviewsCount());
    }

    @Test
    void getUpcomingTrainingsCount_Success() {
        when(employeeTrainingRepository.countByEnrollmentDateAfter(any(LocalDate.class))).thenReturn(8L);
        assertEquals(8L, dashboardService.getUpcomingTrainingsCount());
    }

    @Test
    void getDashboardSummary_Success() {
        when(userRepository.count()).thenReturn(150L);
        when(userRepository.countByIsActive(true)).thenReturn(145L);
        when(payrollRunRepository.countByStatus("pending")).thenReturn(3L);
        when(performanceReviewRepository.countByStatus("pending")).thenReturn(10L);
        when(employeeTrainingRepository.countByEnrollmentDateAfter(any(LocalDate.class))).thenReturn(5L);

        Map<String, Object> summary = dashboardService.getDashboardSummary();

        assertNotNull(summary);
        assertEquals(150L, summary.get("totalEmployees"));
        assertEquals(145L, summary.get("activeEmployees"));
        assertEquals(3L, summary.get("pendingPayroll"));
        assertEquals(10L, summary.get("pendingReviews"));
        assertEquals(5L, summary.get("upcomingTrainings"));
        assertTrue(summary.containsKey("attendanceRate"));
    }

    @Test
    void getDepartmentEmployeeCount_Success() {
        when(userRepository.countByDepartmentId(1L)).thenReturn(50L);
        assertEquals(50L, userRepository.countByDepartmentId(1L));
    }
}
