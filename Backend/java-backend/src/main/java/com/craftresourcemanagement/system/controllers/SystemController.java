package com.craftresourcemanagement.system.controllers;

import com.craftresourcemanagement.system.entities.*;
import com.craftresourcemanagement.system.services.SystemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    // AuditLog endpoints
    @PostMapping("/audit-logs")
    public ResponseEntity<AuditLog> createAuditLog(@RequestBody AuditLog auditLog) {
        return ResponseEntity.ok(systemService.createAuditLog(auditLog));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAllAuditLogs() {
        return ResponseEntity.ok(systemService.getAllAuditLogs());
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

    @GetMapping("/audit-logs/user/{performedBy}/recent")
    public ResponseEntity<List<AuditLog>> getRecentAuditLogsForUser(@PathVariable String performedBy) {
        return ResponseEntity.ok(systemService.getRecentAuditLogsForUser(performedBy));
    }

    // Security - Access Rules
    @PostMapping("/security/access-rules")
    public ResponseEntity<AccessRule> createAccessRule(@RequestBody AccessRule accessRule) {
        return ResponseEntity.ok(systemService.createAccessRule(accessRule));
    }

    @GetMapping("/security/access-rules")
    public ResponseEntity<List<AccessRule>> getAllAccessRules() {
        return ResponseEntity.ok(systemService.getAllAccessRules());
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
}
