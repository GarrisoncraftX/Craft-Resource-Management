package com.craftresourcemanagement.hr.services.impl;

import com.craftresourcemanagement.hr.repositories.*;
import com.craftresourcemanagement.hr.services.DashboardService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Value("${nodejs.service.url}")
    private String leaveManagementServiceUrl;

    private final RestTemplate restTemplate;
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final PayrollRunRepository payrollRunRepository;
    private final PerformanceReviewRepository performanceReviewRepository;
    private final EmployeeTrainingRepository employeeTrainingRepository;

    public DashboardServiceImpl(UserRepository userRepository,
                               AttendanceRepository attendanceRepository,
                               PayrollRunRepository payrollRunRepository,
                               PerformanceReviewRepository performanceReviewRepository,
                               EmployeeTrainingRepository employeeTrainingRepository) {
        this.restTemplate = new RestTemplate();
        this.userRepository = userRepository;
        this.attendanceRepository = attendanceRepository;
        this.payrollRunRepository = payrollRunRepository;
        this.performanceReviewRepository = performanceReviewRepository;
        this.employeeTrainingRepository = employeeTrainingRepository;
    }

    @Override
    public Map<String, Object> getDashboardKpis(Long employeeId) {
        Map<String, Object> kpis = new HashMap<>();
        kpis.put("employeeId", employeeId);

        // Call Node.js Leave Management Service to get leave balance
        try {
            String url = leaveManagementServiceUrl + "/api/leave/balance/" + employeeId;
            ResponseEntity<Integer> response = restTemplate.getForEntity(url, Integer.class);
            Integer leaveBalance = response.getBody();
            kpis.put("leaveBalance", leaveBalance != null ? leaveBalance : 0);
        } catch (Exception e) {
            kpis.put("leaveBalance", 0);
        }

        // Placeholder for other KPIs
        kpis.put("pendingTasks", 5);

        return kpis;
    }

    public long getEmployeeCount() {
        return userRepository.count();
    }

    public long getActiveEmployeeCount() {
        return userRepository.countByIsActive(true);
    }

    public long getTodayAttendanceCount() {
        return attendanceRepository.countByDate(LocalDate.now());
    }

    public double getAttendanceRate() {
        long activeEmployees = userRepository.countByIsActive(true);
        if (activeEmployees == 0) return 0.0;
        long todayAttendance = attendanceRepository.countByDate(LocalDate.now());
        return (double) todayAttendance / activeEmployees * 100.0;
    }

    public long getPendingPayrollCount() {
        return payrollRunRepository.countByStatus("pending");
    }

    public long getPendingReviewsCount() {
        return performanceReviewRepository.countByStatus("pending");
    }

    public long getUpcomingTrainingsCount() {
        return employeeTrainingRepository.countByEnrollmentDateAfter(LocalDate.now());
    }

    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalEmployees", getEmployeeCount());
        summary.put("activeEmployees", getActiveEmployeeCount());
        summary.put("todayAttendance", getTodayAttendanceCount());
        summary.put("pendingPayroll", getPendingPayrollCount());
        summary.put("pendingReviews", getPendingReviewsCount());
        summary.put("upcomingTrainings", getUpcomingTrainingsCount());
        summary.put("attendanceRate", getAttendanceRate());
        return summary;
    }

    public Map<String, Long> getMonthlyAttendanceStats() {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        long totalAttendance = attendanceRepository.countByDateBetween(startOfMonth, endOfMonth);
        
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalAttendance", totalAttendance);
        return stats;
    }
}
