package com.craftresourcemanagement.hr.services;

import com.craftresourcemanagement.hr.entities.Payslip;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${nodejs.service.url}")
    private String nodejsBackendUrl;

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
}
