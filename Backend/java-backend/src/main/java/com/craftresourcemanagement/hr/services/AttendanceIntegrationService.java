package com.craftresourcemanagement.hr.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;
import java.util.Collections;

@Service
public class AttendanceIntegrationService {
    
    @Value("${python.service.url}")
    private String pythonBackendUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> getMonthlyAttendanceStats() {
        try {
            String url = pythonBackendUrl + "/api/attendance/stats/monthly";
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.GET, null, new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            return response.getBody();
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    public List<Map<String, Object>> getUserAttendanceByDateRange(Long userId, String startDate, String endDate) {
        try {
            String url = String.format("%s/api/attendance/user/%d/date-range?startDate=%s&endDate=%s", 
                pythonBackendUrl, userId, startDate, endDate);
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                url, HttpMethod.GET, null, new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
