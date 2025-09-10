package com.craftresourcemanagement.hr.services.impl;

import com.craftresourcemanagement.hr.services.DashboardService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Value("${nodejs.service.url}")
    private String leaveManagementServiceUrl;

    private final RestTemplate restTemplate;

    public DashboardServiceImpl() {
        this.restTemplate = new RestTemplate();
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
}
