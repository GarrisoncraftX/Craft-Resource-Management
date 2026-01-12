package com.craftresourcemanagement.system.services.impl;

import com.craftresourcemanagement.system.entities.*;
import com.craftresourcemanagement.system.repositories.*;
import com.craftresourcemanagement.system.services.SystemService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SystemServiceImpl implements SystemService {

    private final SystemConfigRepository systemConfigRepository;
    private final AuditLogRepository auditLogRepository;
    private final AccessRuleRepository accessRuleRepository;
    private final GuardPostRepository guardPostRepository;
    private final SOPRepository sopRepository;
    private final SecurityIncidentRepository securityIncidentRepository;

    public SystemServiceImpl(SystemConfigRepository systemConfigRepository,
                             AuditLogRepository auditLogRepository,
                             AccessRuleRepository accessRuleRepository,
                             GuardPostRepository guardPostRepository,
                             SOPRepository sopRepository,
                             SecurityIncidentRepository securityIncidentRepository) {
        this.systemConfigRepository = systemConfigRepository;
        this.auditLogRepository = auditLogRepository;
        this.accessRuleRepository = accessRuleRepository;
        this.guardPostRepository = guardPostRepository;
        this.sopRepository = sopRepository;
        this.securityIncidentRepository = securityIncidentRepository;
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

    // AuditLog
    @Override
    public AuditLog createAuditLog(AuditLog auditLog) {
        return auditLogRepository.save(auditLog);
    }

    @Override
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAll();
    }

    @Override
    public AuditLog getAuditLogById(Long id) {
        return auditLogRepository.findById(id).orElse(null);
    }

    @Override
    public List<AuditLog> getRecentAuditLogsForUser(String performedBy) {
        return auditLogRepository.findTop4ByPerformedByOrderByTimestampDesc(performedBy);
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
}
