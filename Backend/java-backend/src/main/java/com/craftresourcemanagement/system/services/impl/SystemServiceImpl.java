package com.craftresourcemanagement.system.services.impl;

import com.craftresourcemanagement.system.entities.SystemConfig;
import com.craftresourcemanagement.system.entities.AuditLog;
import com.craftresourcemanagement.system.repositories.SystemConfigRepository;
import com.craftresourcemanagement.system.repositories.AuditLogRepository;
import com.craftresourcemanagement.system.services.SystemService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SystemServiceImpl implements SystemService {

    private final SystemConfigRepository systemConfigRepository;
    private final AuditLogRepository auditLogRepository;

    public SystemServiceImpl(SystemConfigRepository systemConfigRepository,
                             AuditLogRepository auditLogRepository) {
        this.systemConfigRepository = systemConfigRepository;
        this.auditLogRepository = auditLogRepository;
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
}
