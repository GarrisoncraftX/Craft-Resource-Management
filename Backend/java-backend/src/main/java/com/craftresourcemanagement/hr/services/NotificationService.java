package com.craftresourcemanagement.hr.services;

import com.craftresourcemanagement.hr.entities.Payslip;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    public void sendPayslipEmail(Payslip payslip) {
        // Placeholder for email notification
        logger.info("EMAIL NOTIFICATION: Sending payslip to {} ({}) - Net Pay: {}", 
            payslip.getUser().getEmail(),
            payslip.getUser().getFirstName() + " " + payslip.getUser().getLastName(),
            payslip.getNetPay());
        
        // TODO: Integrate with email service (AWS SES, SendGrid, etc.)
        // Example: emailClient.send(payslip.getUser().getEmail(), "Your Payslip", emailBody);
    }

    public void sendPayslipSMS(Payslip payslip) {
        // Placeholder for SMS notification
        if (payslip.getUser().getPhone() != null) {
            logger.info("SMS NOTIFICATION: Sending to {} - Your salary of {} has been processed", 
                payslip.getUser().getPhone(),
                payslip.getNetPay());
            
            // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
            // Example: smsClient.send(payslip.getUser().getPhone(), "Your salary has been processed");
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
}
