package com.craftresourcemanagement.system.services.impl;

import com.craftresourcemanagement.system.entities.*;
import com.craftresourcemanagement.system.repositories.*;
import com.craftresourcemanagement.system.services.SystemService;
import com.craftresourcemanagement.hr.repositories.UserRepository;
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
    private final ActiveSessionRepository activeSessionRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public SystemServiceImpl(SystemConfigRepository systemConfigRepository,
                             AuditLogRepository auditLogRepository,
                             AccessRuleRepository accessRuleRepository,
                             GuardPostRepository guardPostRepository,
                             SOPRepository sopRepository,
                             SecurityIncidentRepository securityIncidentRepository,
                             SupportTicketRepository supportTicketRepository,
                             ActiveSessionRepository activeSessionRepository,
                             UserRepository userRepository,
                             NotificationRepository notificationRepository) {
        this.systemConfigRepository = systemConfigRepository;
        this.auditLogRepository = auditLogRepository;
        this.accessRuleRepository = accessRuleRepository;
        this.guardPostRepository = guardPostRepository;
        this.sopRepository = sopRepository;
        this.securityIncidentRepository = securityIncidentRepository;
        this.supportTicketRepository = supportTicketRepository;
        this.activeSessionRepository = activeSessionRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
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

    public Optional<SystemConfig> getSystemConfig(String configKey) {
        return systemConfigRepository.findByConfigKey(configKey);
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
    public AuditLog createAuditLogWithDescriptiveAction(AuditLog auditLog) {
        if (auditLog.getTimestamp() == null) {
            auditLog.setTimestamp(LocalDateTime.now());
        }
        
        if (auditLog.getUserId() != null) {
            userRepository.findById(auditLog.getUserId()).ifPresent(user -> {
                String userName = user.getFirstName() + " " + user.getLastName();
                auditLog.setUserName(userName);
                String action = auditLog.getAction();
                
                if (action.startsWith("has ")) {
                    auditLog.setAction(userName + " " + action);
                } else if (!action.toLowerCase().contains("user") && !action.toLowerCase().contains(userName.toLowerCase())) {
                    auditLog.setAction("User " + userName + " " + action);
                }
            });
        }
        
        return auditLogRepository.save(auditLog);
    }

    @Override
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    @Override
    public Page<AuditLog> getAllAuditLogsPaginated(Pageable pageable) {
        return auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(
            LocalDateTime.of(2000, 1, 1, 0, 0), LocalDateTime.now().plusDays(1), pageable);
    }

    @Override
    public AuditLog getAuditLogById(Long id) {
        return auditLogRepository.findById(id).orElse(null);
    }

    public Page<AuditLog> getAuditLogsByUserId(Long userId, Pageable pageable) {
        return auditLogRepository.findByUserId(userId, pageable);
    }

    public List<AuditLog> getAuditLogsByServiceName(String serviceName) {
        return auditLogRepository.findByServiceName(serviceName);
    }

    @Override
    public List<AuditLog> getRecentAuditLogsForUser(Long userId) {
        return auditLogRepository.findTop5ByUserIdOrderByTimestampDesc(userId);
    }

    @Override
    public Page<AuditLog> getAuditLogsForUser(Long userId, LocalDateTime startDate, 
                                              LocalDateTime endDate, Pageable pageable) {
        if (startDate != null && endDate != null) {
            return auditLogRepository.findByUserIdAndTimestampBetweenOrderByTimestampDesc(
                userId, startDate, endDate, pageable);
        }
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
    }

    @Override
    public Page<AuditLog> getAuditLogsForEntity(String entityType, String entityId, Pageable pageable) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(
            entityType, entityId, pageable);
    }

    @Override
    public Page<AuditLog> searchAuditLogs(Long userId, String action, String serviceName,
                                          String entityType, LocalDateTime startDate, 
                                          LocalDateTime endDate, Pageable pageable) {
        return auditLogRepository.searchAuditLogs(
            userId, action, serviceName, entityType, startDate, endDate, pageable);
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
            Object userIdObj = result[0];
            Long userId;
            if (userIdObj instanceof Integer) {
                userId = ((Integer) userIdObj).longValue();
            } else if (userIdObj instanceof Long) {
                userId = (Long) userIdObj;
            } else {
                userId = null;
            }
            map.put("user", userId);
            map.put("count", result[1]);
            topUsers.add(map);
        }
        
        return topUsers;
    }

    @Override
    public Map<String, Object> getAuditStatistics(Long userId, String action,
                                                   LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> stats = new HashMap<>();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.toLocalDate().atStartOfDay();
        LocalDateTime weekStart = now.minusDays(7);
        
        long totalLogs = auditLogRepository.count();
        
        Page<AuditLog> todayPage = auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(
            todayStart, now, Pageable.unpaged());
        long todayLogs = todayPage.getTotalElements();
        
        Page<AuditLog> weekPage = auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(
            weekStart, now, Pageable.unpaged());
        long weekLogs = weekPage.getTotalElements();
        
        stats.put("totalLogs", totalLogs);
        stats.put("todayLogs", todayLogs);
        stats.put("weekLogs", weekLogs);
        
        return stats;
    }

    @Override
    public AuditLog updateAuditLog(Long id, AuditLog auditLog) {
        Optional<AuditLog> existing = auditLogRepository.findById(id);
        if (existing.isPresent()) {
            AuditLog toUpdate = existing.get();
            toUpdate.setAction(auditLog.getAction());
            toUpdate.setUserId(auditLog.getUserId());
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

    public List<SOP> getSOPsByCategory(String category) {
        return sopRepository.findByCategory(category);
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

    public Optional<SupportTicket> getSupportTicketById(Long id) {
        return supportTicketRepository.findById(id);
    }

    public List<SupportTicket> getSupportTicketsByUserId(Long userId) {
        return supportTicketRepository.findByUserId(userId);
    }

    public SupportTicket updateTicketStatus(Long id, String status) {
        return supportTicketRepository.findById(id).map(ticket -> {
            ticket.setStatus(status);
            return supportTicketRepository.save(ticket);
        }).orElse(null);
    }

    // Session Tracking
    @Override
    public ActiveSession createOrUpdateSession(ActiveSession session) {
        session.setLastActivity(LocalDateTime.now());
        ActiveSession saved = activeSessionRepository.save(session);
        Long userId = saved.getUserId() != null ? Long.valueOf(saved.getUserId()) : null;
        if (userId != null) {
            userRepository.findById(userId).ifPresent(user -> {
                saved.setFirstName(user.getFirstName());
                saved.setLastName(user.getLastName());
            });
        }
        return saved;
    }

    @Override
    public void deleteSession(String sessionId) {
        activeSessionRepository.deleteById(sessionId);
    }

    @Override
    public long getActiveSessionCount() {
        return activeSessionRepository.count();
    }

    @Override
    public void cleanupInactiveSessions(int timeoutMinutes) {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(timeoutMinutes);
        activeSessionRepository.deleteInactiveSessions(threshold);
    }

    // Notifications
    @Override
    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public Notification markAsRead(Long id) {
        return notificationRepository.findById(id).map(notification -> {
            notification.setIsRead(true);
            return notificationRepository.save(notification);
        }).orElse(null);
    }

    @Override
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    public Notification markNotificationAsRead(Long id) {
        return notificationRepository.findById(id).map(notification -> {
            notification.setRead(true);
            return notificationRepository.save(notification);
        }).orElse(null);
    }

    public long getUnreadNotificationCount(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }
}
