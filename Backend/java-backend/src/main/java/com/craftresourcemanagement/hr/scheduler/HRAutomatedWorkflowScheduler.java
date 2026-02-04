package com.craftresourcemanagement.hr.scheduler;

import com.craftresourcemanagement.hr.services.EmployeeService;
import com.craftresourcemanagement.hr.services.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class HRAutomatedWorkflowScheduler {

    private static final Logger log = LoggerFactory.getLogger(HRAutomatedWorkflowScheduler.class);
    private final EmployeeService employeeService;
    private final NotificationService notificationService;

    public HRAutomatedWorkflowScheduler(EmployeeService employeeService, NotificationService notificationService) {
        this.employeeService = employeeService;
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "0 0 10 * * *") // Daily at 10 AM
    public void sendBirthdayAndAnniversaryNotifications() {
        log.info("Running birthday/anniversary notifications job");
        
        var birthdayEmployees = employeeService.getEmployeesWithBirthdayToday();
        birthdayEmployees.forEach(notificationService::sendBirthdayGreeting);
        
        var anniversaryEmployees = employeeService.getEmployeesWithAnniversaryToday();
        anniversaryEmployees.forEach(notificationService::sendAnniversaryGreeting);
    }

    @Scheduled(cron = "0 0 8 * * *") // Daily at 8 AM
    public void probationEndAlerts() {
        log.info("Running probation end alerts job");
        var twoWeeksFromNow = LocalDate.now().plusWeeks(2);
        var employees = employeeService.getEmployeesWithProbationEndingOn(twoWeeksFromNow);
        employees.forEach(notificationService::sendProbationEndAlert);
    }

    @Scheduled(cron = "0 0 8 * * *") // Daily at 8 AM
    public void contractRenewalReminders() {
        log.info("Running contract renewal reminders job");
        var oneMonthFromNow = LocalDate.now().plusMonths(1);
        var employees = employeeService.getEmployeesWithContractExpiringOn(oneMonthFromNow);
        employees.forEach(notificationService::sendContractRenewalReminder);
    }

    @Scheduled(cron = "0 0 10 * * *") // Daily at 10 AM
    public void trainingDueDateReminders() {
        log.info("Running training due date reminders job");
        var threeDaysFromNow = LocalDate.now().plusDays(3);
        var trainings = employeeService.getTrainingsEndingOn(threeDaysFromNow);
        trainings.forEach(notificationService::sendTrainingDueReminder);
    }

    @Scheduled(cron = "0 0 9 1 * *") // 1st of month at 9 AM
    public void performanceReviewCycleScheduling() {
        log.info("Running performance review cycle scheduling job");
        employeeService.autoSchedulePerformanceReviews();
    }

    @Scheduled(cron = "0 0 10 1 * *") // 1st of month at 10 AM
    public void leaveBalanceAlerts() {
        log.info("Running leave balance alerts job");
        var employees = employeeService.getEmployeesWithLowLeaveBalance(5);
        employees.forEach(notificationService::sendLeaveBalanceAlert);
    }
}
