package com.craftresourcemanagement.hr.services;

import com.craftresourcemanagement.hr.entities.EmployeeTraining;
import com.craftresourcemanagement.hr.entities.Payslip;
import com.craftresourcemanagement.hr.entities.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.time.LocalDate;
import java.time.Period;
import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final HRNotificationService hrNotificationService;
    
    @Value("${nodejs.service.url}")
    private String nodejsBackendUrl;

    public NotificationService(HRNotificationService hrNotificationService) {
        this.hrNotificationService = hrNotificationService;
    }

    public void sendPayslipEmail(Payslip payslip) {
        try {
            Map<String, Object> emailRequest = new HashMap<>();
            emailRequest.put("to", payslip.getUser().getEmail());
            emailRequest.put("subject", "Your Payslip - " + payslip.getPayPeriodStart() + " to " + payslip.getPayPeriodEnd());
            emailRequest.put("text", String.format(
                "Dear %s %s,\n\nYour salary for the period %s to %s has been processed.\n\nNet Pay: $%.2f\n\nThank you,\nCraft Resource Management",
                payslip.getUser().getFirstName(),
                payslip.getUser().getLastName(),
                payslip.getPayPeriodStart(),
                payslip.getPayPeriodEnd(),
                payslip.getNetPay()
            ));
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(emailRequest, headers);
            
            restTemplate.postForObject(nodejsBackendUrl + "/api/communication/send-email", request, String.class);
            logger.info("EMAIL NOTIFICATION: Sent payslip to {} ({}) - Net Pay: {}", 
                payslip.getUser().getEmail(),
                payslip.getUser().getFirstName() + " " + payslip.getUser().getLastName(),
                payslip.getNetPay());
        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}", payslip.getUser().getEmail(), e.getMessage());
        }
    }

    public void sendPayslipSMS(Payslip payslip) {
        if (payslip.getUser().getPhone() != null) {
            logger.info("SMS NOTIFICATION: Sending to {} - Your salary of {} has been processed", 
                payslip.getUser().getPhone(),
                payslip.getNetPay());
        }
    }

    public void sendBulkPayrollNotifications(java.util.List<Payslip> payslips) {
        logger.info("Sending notifications for {} payslips", payslips.size());
        
        for (Payslip payslip : payslips) {
            try {
                sendPayslipEmail(payslip);
                sendPayslipSMS(payslip);
            } catch (Exception e) {
                logger.error("Failed to send notification for employee {}: {}", 
                    payslip.getUser().getEmployeeId(), e.getMessage());
            }
        }
        
        logger.info("Completed sending notifications for {} payslips", payslips.size());
    }
    
    // Automated workflow notification methods
    public void sendBirthdayGreeting(User employee) {
        logger.info("BIRTHDAY: Sending greeting to {} ({})", employee.getEmail(), employee.getFirstName());
        hrNotificationService.sendNotification(
            employee.getId(),
            "🎉 Happy Birthday!",
            String.format("Happy Birthday %s! Wishing you a wonderful day filled with joy and happiness. The entire team wishes you all the best!", employee.getFirstName()),
            "INFO"
        );
    }
    
    public void sendAnniversaryGreeting(User employee) {
        logger.info("ANNIVERSARY: Sending greeting to {} ({})", employee.getEmail(), employee.getFirstName());
        if (employee.getHireDate() != null) {
            int years = Period.between(employee.getHireDate(), LocalDate.now()).getYears();
            hrNotificationService.sendNotification(
                employee.getId(),
                "🎊 Work Anniversary!",
                String.format("Congratulations %s on completing %d year%s with us! Thank you for your dedication and hard work.", 
                    employee.getFirstName(), years, years > 1 ? "s" : ""),
                "SUCCESS"
            );
        }
    }
    
    public void sendProbationEndAlert(User employee) {
        logger.info("PROBATION ALERT: Notifying HR about {} - probation ending soon", employee.getEmployeeId());
        hrNotificationService.sendNotification(
            employee.getId(),
            "Probation Period Ending Soon",
            String.format("Your probation period will end in 2 weeks. Please ensure all required tasks are completed."),
            "WARNING"
        );
    }
    
    public void sendContractRenewalReminder(User employee) {
        logger.info("CONTRACT RENEWAL: Alerting HR about {} - contract expiring soon", employee.getEmployeeId());
        hrNotificationService.sendNotification(
            employee.getId(),
            "Contract Renewal Reminder",
            "Your employment contract will expire in 1 month. Please contact HR for renewal procedures.",
            "WARNING"
        );
    }
    
    public void sendTrainingDueReminder(EmployeeTraining training) {
        logger.info("TRAINING REMINDER: Notifying {} about upcoming training", training.getUser().getEmail());
        hrNotificationService.sendNotification(
            training.getUser().getId(),
            "Training Reminder",
            String.format("Reminder: Your training is due in 3 days. Please ensure you complete it on time."),
            "INFO"
        );
    }
    
    public void sendLeaveBalanceAlert(User employee) {
        logger.info("LEAVE BALANCE: Alerting {} about low leave balance", employee.getEmail());
        hrNotificationService.sendNotification(
            employee.getId(),
            "Low Leave Balance",
            "Your leave balance is running low. Please plan your leaves accordingly.",
            "INFO"
        );
    }
}
