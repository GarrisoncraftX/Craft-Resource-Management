package com.craftresourcemanagement.system.services;

import com.craftresourcemanagement.system.entities.SystemConfig;
import com.craftresourcemanagement.system.entities.AuditLog;

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
    AuditLog updateAuditLog(Long id, AuditLog auditLog);
    void deleteAuditLog(Long id);
}
