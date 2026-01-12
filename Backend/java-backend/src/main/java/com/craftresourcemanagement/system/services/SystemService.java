package com.craftresourcemanagement.system.services;

import com.craftresourcemanagement.system.entities.*;

import java.util.List;

public interface SystemService {

    // SystemConfig
    SystemConfig createSystemConfig(SystemConfig systemConfig);
    List<SystemConfig> getAllSystemConfigs();
    SystemConfig getSystemConfigById(Long id);
    SystemConfig updateSystemConfig(Long id, SystemConfig systemConfig);
    void deleteSystemConfig(Long id);

    // AuditLog
    AuditLog createAuditLog(AuditLog auditLog);
    List<AuditLog> getAllAuditLogs();
    AuditLog getAuditLogById(Long id);
    List<AuditLog> getRecentAuditLogsForUser(String performedBy);
    AuditLog updateAuditLog(Long id, AuditLog auditLog);
    void deleteAuditLog(Long id);

    // Security - Access Rules
    AccessRule createAccessRule(AccessRule accessRule);
    List<AccessRule> getAllAccessRules();

    // Security - Guard Posts
    GuardPost createGuardPost(GuardPost guardPost);
    List<GuardPost> getAllGuardPosts();

    // Security - SOPs
    SOP createSOP(SOP sop);
    List<SOP> getAllSOPs();

    // Security - Incidents
    SecurityIncident createSecurityIncident(SecurityIncident incident);
    List<SecurityIncident> getAllSecurityIncidents();
}
