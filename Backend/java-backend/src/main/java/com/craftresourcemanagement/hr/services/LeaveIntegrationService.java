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
public class LeaveIntegrationService {
    
    @Value("${nodejs.service.url}")
    private String nodejsBackendUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getUserLeaveRequests(Long userId, String status) {
        try {
            String url = String.format("%s/api/leave/user/%d?status=%s", nodejsBackendUrl, userId, status);
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.GET, null, new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> body = response.getBody();
            return body != null ? (List<Map<String, Object>>) body.get("data") : Collections.emptyList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getEmployeesOnLeave() {
        try {
            String url = nodejsBackendUrl + "/api/leave/employees-on-leave";
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.GET, null, new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> body = response.getBody();
            return body != null ? (List<Map<String, Object>>) body.get("data") : Collections.emptyList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
