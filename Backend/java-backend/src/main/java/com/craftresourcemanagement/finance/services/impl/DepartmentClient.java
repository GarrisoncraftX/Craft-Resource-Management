package com.craftresourcemanagement.finance.services.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.core.ParameterizedTypeReference;


import java.util.List;
import java.util.Map;


@Component
public class DepartmentClient {

    private final WebClient webClient;

    public DepartmentClient(@Value("${nodejs.service.url}") String baseUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public String getDepartmentNameById(Long departmentId) {
        List<Map<String, Object>> departments = webClient.get()
                .uri("/api/lookup/departments")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                .block();

        if (departments == null) {
            return null;
        }

        return departments.stream()
                .filter(dept -> dept.get("id") != null && dept.get("id").equals(departmentId.intValue()))
                .map(dept -> (String) dept.get("name"))
                .findFirst()
                .orElse(null);
    }
}
