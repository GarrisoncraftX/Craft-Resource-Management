package com.craftresourcemanagement.hr.services;

import java.util.Map;

public interface DashboardService {
    Map<String, Object> getDashboardKpis(Long employeeId);
}
