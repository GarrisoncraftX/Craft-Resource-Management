package com.craftresourcemanagement.system.controllers;

import com.craftresourcemanagement.system.entities.*;
import com.craftresourcemanagement.system.services.SystemService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/system")
public class SystemController {

    private final SystemService systemService;

    public SystemController(SystemService systemService) {
        this.systemService = systemService;
    }

    // SystemConfig endpoints
    @PostMapping("/configs")
    public ResponseEntity<SystemConfig> createSystemConfig(@RequestBody SystemConfig systemConfig) {
        return ResponseEntity.ok(systemService.createSystemConfig(systemConfig));
    }

    @GetMapping("/configs")
    public ResponseEntity<List<SystemConfig>> getAllSystemConfigs() {
        return ResponseEntity.ok(systemService.getAllSystemConfigs());
    }

    @GetMapping("/configs/{id}")
    public ResponseEntity<SystemConfig> getSystemConfigById(@PathVariable Long id) {
        SystemConfig config = systemService.getSystemConfigById(id);
        if (config == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(config);
    }

    @PutMapping("/configs/{id}")
    public ResponseEntity<SystemConfig> updateSystemConfig(@PathVariable Long id, @RequestBody SystemConfig systemConfig) {
        SystemConfig updated = systemService.updateSystemConfig(id, systemConfig);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/configs/{id}")
    public ResponseEntity<Void> deleteSystemConfig(@PathVariable Long id) {
        systemService.deleteSystemConfig(id);
        return ResponseEntity.noContent().build();
    }

    // AuditLog endpoints - Enhanced with pagination and filtering
    @PostMapping("/audit-logs")
    public ResponseEntity<AuditLog> createAuditLog(@RequestBody AuditLog auditLog) {
        return ResponseEntity.ok(systemService.createAuditLogWithDescriptiveAction(auditLog));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLog>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(systemService.getAllAuditLogsPaginated(pageable));
    }

    @GetMapping("/audit-logs/search")
    public ResponseEntity<Page<AuditLog>> searchAuditLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String serviceName,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(systemService.searchAuditLogs(
            userId, action, serviceName, entityType, startDate, endDate, pageable));
    }

    @GetMapping("/audit-logs/{id}")
    public ResponseEntity<AuditLog> getAuditLogById(@PathVariable Long id) {
        AuditLog auditLog = systemService.getAuditLogById(id);
        if (auditLog == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(auditLog);
    }

    @PutMapping("/audit-logs/{id}")
    public ResponseEntity<AuditLog> updateAuditLog(@PathVariable Long id, @RequestBody AuditLog auditLog) {
        AuditLog updated = systemService.updateAuditLog(id, auditLog);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/audit-logs/{id}")
    public ResponseEntity<Void> deleteAuditLog(@PathVariable Long id) {
        systemService.deleteAuditLog(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/audit-logs/user/{userId}/recent")
    public ResponseEntity<List<AuditLog>> getRecentAuditLogsForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(systemService.getRecentAuditLogsForUser(userId));
    }

    @GetMapping("/audit-logs/user/{userId}")
    public ResponseEntity<Page<AuditLog>> getAuditLogsForUser(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(systemService.getAuditLogsForUser(userId, startDate, endDate, pageable));
    }

    @GetMapping("/audit-logs/entity/{entityType}/{entityId}")
    public ResponseEntity<Page<AuditLog>> getAuditLogsForEntity(
            @PathVariable String entityType,
            @PathVariable String entityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(systemService.getAuditLogsForEntity(entityType, entityId, pageable));
    }

    @GetMapping("/audit-logs/analytics/top-actions")
    public ResponseEntity<List<Map<String, Object>>> getTopActions(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(systemService.getTopActions(days));
    }

    @GetMapping("/audit-logs/analytics/top-users")
    public ResponseEntity<List<Map<String, Object>>> getTopUsers(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(systemService.getTopUsers(days));
    }

    @GetMapping("/audit-logs/analytics/statistics")
    public ResponseEntity<Map<String, Object>> getAuditStatistics(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(systemService.getAuditStatistics(userId, action, startDate, endDate));
    }


    // Security - Guard Posts
    @PostMapping("/security/guard-posts")
    public ResponseEntity<GuardPost> createGuardPost(@RequestBody GuardPost guardPost) {
        return ResponseEntity.ok(systemService.createGuardPost(guardPost));
    }

    @GetMapping("/security/guard-posts")
    public ResponseEntity<List<GuardPost>> getAllGuardPosts() {
        return ResponseEntity.ok(systemService.getAllGuardPosts());
    }

    // Security - SOPs
    @PostMapping("/security/sops")
    public ResponseEntity<SOP> createSOP(@RequestBody SOP sop) {
        return ResponseEntity.ok(systemService.createSOP(sop));
    }

    @GetMapping("/security/sops")
    public ResponseEntity<List<SOP>> getAllSOPs() {
        return ResponseEntity.ok(systemService.getAllSOPs());
    }

    // Security - Incidents
    @PostMapping("/security/incidents")
    public ResponseEntity<SecurityIncident> createSecurityIncident(@RequestBody SecurityIncident incident) {
        return ResponseEntity.ok(systemService.createSecurityIncident(incident));
    }

    @GetMapping("/security/incidents")
    public ResponseEntity<List<SecurityIncident>> getAllSecurityIncidents() {
        return ResponseEntity.ok(systemService.getAllSecurityIncidents());
    }

    // Notifications
    @PostMapping("/notifications")
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        return ResponseEntity.ok(systemService.createNotification(notification));
    }

    @GetMapping("/notifications/user/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(systemService.getNotificationsByUserId(userId));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<Notification> markNotificationAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(systemService.markAsRead(id));
    }

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        systemService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/notifications/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("count", systemService.getUnreadCount(userId)));
    }
}
