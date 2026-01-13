package com.craftresourcemanagement.system.services.impl;

import com.craftresourcemanagement.system.entities.*;
import com.craftresourcemanagement.system.repositories.*;
import com.craftresourcemanagement.system.services.SystemService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SystemServiceImpl implements SystemService {

    private final SystemConfigRepository systemConfigRepository;
    private final AuditLogRepository auditLogRepository;
    private final AccessRuleRepository accessRuleRepository;
    private final GuardPostRepository guardPostRepository;
    private final SOPRepository sopRepository;
    private final SecurityIncidentRepository securityIncidentRepository;
    private final SupportTicketRepository supportTicketRepository;

    public SystemServiceImpl(SystemConfigRepository systemConfigRepository,
                             AuditLogRepository auditLogRepository,
                             AccessRuleRepository accessRuleRepository,
                             GuardPostRepository guardPostRepository,
                             SOPRepository sopRepository,
                             SecurityIncidentRepository securityIncidentRepository,
                             SupportTicketRepository supportTicketRepository) {
        this.systemConfigRepository = systemConfigRepository;
        this.auditLogRepository = auditLogRepository;
        this.accessRuleRepository = accessRuleRepository;
        this.guardPostRepository = guardPostRepository;
        this.sopRepository = sopRepository;
        this.securityIncidentRepository = securityIncidentRepository;
        this.supportTicketRepository = supportTicketRepository;
    }

    // SystemConfig
    @Override
    public SystemConfig createSystemConfig(SystemConfig systemConfig) {
        return systemConfigRepository.save(systemConfig);
    }

    @Override
    public List<SystemConfig> getAllSystemConfigs() {
        return systemConfigRepository.findAll();
    }

    @Override
    public SystemConfig getSystemConfigById(Long id) {
        return systemConfigRepository.findById(id).orElse(null);
    }

    @Override
    public SystemConfig updateSystemConfig(Long id, SystemConfig systemConfig) {
        Optional<SystemConfig> existing = systemConfigRepository.findById(id);
        if (existing.isPresent()) {
            SystemConfig toUpdate = existing.get();
            toUpdate.setConfigKey(systemConfig.getConfigKey());
            toUpdate.setConfigValue(systemConfig.getConfigValue());
            toUpdate.setDescription(systemConfig.getDescription());
            return systemConfigRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deleteSystemConfig(Long id) {
        systemConfigRepository.deleteById(id);
    }

    // AuditLog - Enhanced Implementation
    @Override
    public AuditLog createAuditLog(AuditLog auditLog) {
        if (auditLog.getTimestamp() == null) {
            auditLog.setTimestamp(LocalDateTime.now());
        }
        return auditLogRepository.save(auditLog);
    }

    @Override
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAll();
    }

    @Override
    public Page<AuditLog> getAllAuditLogsPaginated(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }

    @Override
    public AuditLog getAuditLogById(Long id) {
        return auditLogRepository.findById(id).orElse(null);
    }

    @Override
    public List<AuditLog> getRecentAuditLogsForUser(String performedBy) {
        return auditLogRepository.findTop5ByPerformedByOrderByTimestampDesc(performedBy);
    }

    @Override
    public Page<AuditLog> getAuditLogsForUser(String performedBy, LocalDateTime startDate, 
                                              LocalDateTime endDate, Pageable pageable) {
        if (startDate != null && endDate != null) {
            return auditLogRepository.findByPerformedByAndTimestampBetweenOrderByTimestampDesc(
                performedBy, startDate, endDate, pageable);
        }
        return auditLogRepository.findByPerformedByOrderByTimestampDesc(performedBy, pageable);
    }

    @Override
    public Page<AuditLog> getAuditLogsForEntity(String entityType, String entityId, Pageable pageable) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(
            entityType, entityId, pageable);
    }

    @Override
    public Page<AuditLog> searchAuditLogs(String performedBy, String action, String serviceName,
                                          String entityType, LocalDateTime startDate, 
                                          LocalDateTime endDate, Pageable pageable) {
        return auditLogRepository.searchAuditLogs(
            performedBy, action, serviceName, entityType, startDate, endDate, pageable);
    }

    @Override
    public List<Map<String, Object>> getTopActions(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Object[]> results = auditLogRepository.getTopActionsSince(since);
        List<Map<String, Object>> topActions = new ArrayList<>();
        
        for (Object[] result : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("action", result[0]);
            map.put("count", result[1]);
            topActions.add(map);
        }
        
        return topActions;
    }

    @Override
    public List<Map<String, Object>> getTopUsers(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Object[]> results = auditLogRepository.getTopUsersSince(since);
        List<Map<String, Object>> topUsers = new ArrayList<>();
        
        for (Object[] result : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("user", result[0]);
            map.put("count", result[1]);
            topUsers.add(map);
        }
        
        return topUsers;
    }

    @Override
    public Map<String, Object> getAuditStatistics(String performedBy, String action,
                                                   LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> stats = new HashMap<>();
        
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        
        long totalCount;
        if (performedBy != null) {
            totalCount = auditLogRepository.countByPerformedByAndTimestampBetween(
                performedBy, startDate, endDate);
            stats.put("user", performedBy);
        } else if (action != null) {
            totalCount = auditLogRepository.countByActionAndTimestampBetween(
                action, startDate, endDate);
            stats.put("action", action);
        } else {
            totalCount = auditLogRepository.count();
        }
        
        stats.put("totalCount", totalCount);
        stats.put("startDate", startDate);
        stats.put("endDate", endDate);
        
        return stats;
    }

    @Override
    public AuditLog updateAuditLog(Long id, AuditLog auditLog) {
        Optional<AuditLog> existing = auditLogRepository.findById(id);
        if (existing.isPresent()) {
            AuditLog toUpdate = existing.get();
            toUpdate.setAction(auditLog.getAction());
            toUpdate.setPerformedBy(auditLog.getPerformedBy());
            toUpdate.setTimestamp(auditLog.getTimestamp());
            toUpdate.setDetails(auditLog.getDetails());
            return auditLogRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deleteAuditLog(Long id) {
        auditLogRepository.deleteById(id);
    }

    // Security - Access Rules
    @Override
    public AccessRule createAccessRule(AccessRule accessRule) {
        return accessRuleRepository.save(accessRule);
    }

    @Override
    public List<AccessRule> getAllAccessRules() {
        return accessRuleRepository.findAll();
    }

    // Security - Guard Posts
    @Override
    public GuardPost createGuardPost(GuardPost guardPost) {
        return guardPostRepository.save(guardPost);
    }

    @Override
    public List<GuardPost> getAllGuardPosts() {
        return guardPostRepository.findAll();
    }

    // Security - SOPs
    @Override
    public SOP createSOP(SOP sop) {
        return sopRepository.save(sop);
    }

    @Override
    public List<SOP> getAllSOPs() {
        return sopRepository.findAll();
    }

    // Security - Incidents
    @Override
    public SecurityIncident createSecurityIncident(SecurityIncident incident) {
        return securityIncidentRepository.save(incident);
    }

    @Override
    public List<SecurityIncident> getAllSecurityIncidents() {
        return securityIncidentRepository.findAll();
    }

    // Support Tickets
    @Override
    public SupportTicket createSupportTicket(SupportTicket ticket) {
        return supportTicketRepository.save(ticket);
    }

    @Override
    public List<SupportTicket> getAllSupportTickets() {
        return supportTicketRepository.findAll();
    }
}
