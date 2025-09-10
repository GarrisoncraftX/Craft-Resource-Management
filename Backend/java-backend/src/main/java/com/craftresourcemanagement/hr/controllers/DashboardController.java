package com.craftresourcemanagement.hr.controllers;

import com.craftresourcemanagement.hr.services.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hr")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard-kpis/{employeeId}")
    public ResponseEntity<?> getDashboardKpis(@PathVariable Long employeeId) {
        // For now, return a placeholder response
        return ResponseEntity.ok(dashboardService.getDashboardKpis(employeeId));
    }
}
