package com.craftresourcemanagement.hr.services;

import com.craftresourcemanagement.system.entities.Notification;
import com.craftresourcemanagement.system.repositories.NotificationRepository;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;

@Service
public class HRNotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(HRNotificationService.class);
    private final NotificationRepository notificationRepository;

    public HRNotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void sendNotification(Long userId, String title, String message, String type) {
        try {
            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setType(type);
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
            logger.info("Notification sent to user {}: {}", userId, title);
        } catch (Exception e) {
            logger.error("Failed to send notification to user {}: {}", userId, e.getMessage());
        }
    }

    public void notifyPayrollProcessed(Long userId, String employeeName, Double netPay, String periodStart, String periodEnd) {
        sendNotification(
            userId,
            "Payroll Processed",
            String.format("Dear %s, your salary for %s to %s has been processed. Net Pay: $%.2f", 
                employeeName, periodStart, periodEnd, netPay),
            "SUCCESS"
        );
    }

    public void notifyTrainingEnrollment(Long userId, String courseName, String startDate) {
        sendNotification(
            userId,
            "Training Enrollment",
            String.format("You have been enrolled in %s starting on %s.", courseName, startDate),
            "INFO"
        );
    }

    public void notifyPerformanceReview(Long userId, String reviewDate) {
        sendNotification(
            userId,
            "Performance Review Scheduled",
            String.format("Your performance review has been scheduled for %s.", reviewDate),
            "INFO"
        );
    }

    public void notifyOnboarding(Long userId, String firstName) {
        sendNotification(
            userId,
            "Welcome to the Team!",
            String.format("Welcome %s! Please complete your onboarding checklist and submit required documents.", firstName),
            "INFO"
        );
    }

    public void notifyOffboarding(Long userId, String exitDate) {
        sendNotification(
            userId,
            "Exit Process Initiated",
            String.format("Your exit process has been initiated. Exit date: %s. Please complete the clearance checklist.", exitDate),
            "WARNING"
        );
    }

    public void notifyBenefitEnrollment(Long userId, String benefitPlan) {
        sendNotification(
            userId,
            "Benefit Enrollment Confirmed",
            String.format("You have been successfully enrolled in %s.", benefitPlan),
            "SUCCESS"
        );
    }

    public void notifyAttendanceIssue(Long userId, String issue) {
        sendNotification(
            userId,
            "Attendance Notice",
            issue,
            "WARNING"
        );
    }
}
