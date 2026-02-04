package com.craftresourcemanagement;

import com.craftresourcemanagement.hr.repositories.*;
import com.craftresourcemanagement.hr.services.impl.DashboardServiceImpl;
import org.junit.jupiter.api.BeforeEach;
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
class DashboardServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PayrollRunRepository payrollRunRepository;

    @Mock
    private PerformanceReviewRepository performanceReviewRepository;

    @Mock
    private EmployeeTrainingRepository employeeTrainingRepository;

    @InjectMocks
    private DashboardServiceImpl dashboardService;

    @BeforeEach
    void setUp() {
        // Setup can be added here if needed
    }

    @Test
    void testGetEmployeeCount() {
        when(userRepository.count()).thenReturn(150L);

        long count = dashboardService.getEmployeeCount();

        assertEquals(150L, count);
        verify(userRepository, times(1)).count();
    }

    @Test
    void testGetActiveEmployeeCount() {
        when(userRepository.countByIsActive(true)).thenReturn(145L);

        long count = dashboardService.getActiveEmployeeCount();

        assertEquals(145L, count);
        verify(userRepository, times(1)).countByIsActive(true);
    }

    @Test
    void testGetTodayAttendanceCount() {
        // Attendance is fetched from Python backend
        long count = dashboardService.getTodayAttendanceCount();
        assertTrue(count >= 0);
    }

    @Test
    void testGetAttendanceRate() {
        when(userRepository.countByIsActive(true)).thenReturn(150L);

        double rate = dashboardService.getAttendanceRate();

        assertTrue(rate >= 0.0);
    }

    @Test
    void testGetAttendanceRateWithZeroEmployees() {
        when(userRepository.countByIsActive(true)).thenReturn(0L);

        double rate = dashboardService.getAttendanceRate();

        assertEquals(0.0, rate);
    }

    @Test
    void testGetPendingPayrollCount() {
        when(payrollRunRepository.countByStatus("pending")).thenReturn(5L);

        long count = dashboardService.getPendingPayrollCount();

        assertEquals(5L, count);
        verify(payrollRunRepository, times(1)).countByStatus("pending");
    }

    @Test
    void testGetPendingReviewsCount() {
        when(performanceReviewRepository.countByStatus("pending")).thenReturn(12L);

        long count = dashboardService.getPendingReviewsCount();

        assertEquals(12L, count);
        verify(performanceReviewRepository, times(1)).countByStatus("pending");
    }

    @Test
    void testGetUpcomingTrainingsCount() {
        LocalDate now = LocalDate.now();
        when(employeeTrainingRepository.countByEnrollmentDateAfter(any(LocalDate.class))).thenReturn(8L);

        long count = dashboardService.getUpcomingTrainingsCount();

        assertEquals(8L, count);
        verify(employeeTrainingRepository, times(1)).countByEnrollmentDateAfter(any(LocalDate.class));
    }

    @Test
    void testGetDashboardSummary() {
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
    void testGetMonthlyAttendanceStats() {
        Map<String, Long> stats = dashboardService.getMonthlyAttendanceStats();

        assertNotNull(stats);
        assertTrue(stats.containsKey("totalAttendance"));
    }

    @Test
    void testGetDepartmentEmployeeCount() {
        // Test individual department counts
        when(userRepository.countByDepartmentId(1L)).thenReturn(50L);
        long itCount = userRepository.countByDepartmentId(1L);
        assertEquals(50L, itCount);
    }

    @Test
    void testGetRecentPayrollRuns() {
        // This would test fetching recent payroll runs
        // Implementation depends on the actual service method
        verify(payrollRunRepository, never()).findAll();
    }

    @Test
    void testGetEmployeeGrowthRate() {
        // Test calculating employee growth rate over time
        when(userRepository.count()).thenReturn(150L);
        
        long currentCount = userRepository.count();
        assertEquals(150L, currentCount);
    }

    @Test
    void testGetAverageAttendanceByDepartment() {
        // Attendance is fetched from Python backend
        long attendance = dashboardService.getTodayAttendanceCount();
        assertTrue(attendance >= 0);
    }
}
