package com.craftresourcemanagement.system.services;

import com.craftresourcemanagement.system.entities.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface SystemService {

    // SystemConfig
    SystemConfig createSystemConfig(SystemConfig systemConfig);
    List<SystemConfig> getAllSystemConfigs();
    SystemConfig getSystemConfigById(Long id);
    SystemConfig updateSystemConfig(Long id, SystemConfig systemConfig);
    void deleteSystemConfig(Long id);

    // AuditLog - Enhanced
    AuditLog createAuditLog(AuditLog auditLog);
    AuditLog createAuditLogWithDescriptiveAction(AuditLog auditLog);
    List<AuditLog> getAllAuditLogs();
    Page<AuditLog> getAllAuditLogsPaginated(Pageable pageable);
    AuditLog getAuditLogById(Long id);
    List<AuditLog> getRecentAuditLogsForUser(Long userId);
    Page<AuditLog> getAuditLogsForUser(Long userId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    Page<AuditLog> getAuditLogsForEntity(String entityType, String entityId, Pageable pageable);
    Page<AuditLog> searchAuditLogs(Long userId, String action, String serviceName, 
                                   String entityType, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    List<Map<String, Object>> getTopActions(int days);
    List<Map<String, Object>> getTopUsers(int days);
    Map<String, Object> getAuditStatistics(Long userId, String action, LocalDateTime startDate, LocalDateTime endDate);
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

    // Support Tickets
    SupportTicket createSupportTicket(SupportTicket ticket);
    List<SupportTicket> getAllSupportTickets();

    // Session Tracking
    ActiveSession createOrUpdateSession(ActiveSession session);
    void deleteSession(String sessionId);
    long getActiveSessionCount();
    void cleanupInactiveSessions(int timeoutMinutes);

    // Notifications
    Notification createNotification(Notification notification);
    List<Notification> getNotificationsByUserId(Long userId);
    Notification markAsRead(Long id);
    void deleteNotification(Long id);
    long getUnreadCount(Long userId);
}
