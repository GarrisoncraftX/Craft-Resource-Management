package com.craftresourcemanagement;

import com.craftresourcemanagement.system.entities.*;
import com.craftresourcemanagement.system.repositories.*;
import com.craftresourcemanagement.system.services.impl.SystemServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SystemServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private SupportTicketRepository supportTicketRepository;

    @Mock
    private SystemConfigRepository systemConfigRepository;

    @Mock
    private SOPRepository sopRepository;

    @Mock
    private SecurityIncidentRepository securityIncidentRepository;

    @InjectMocks
    private SystemServiceImpl systemService;

    private AuditLog testAuditLog;
    private Notification testNotification;
    private SupportTicket testTicket;

    @BeforeEach
    void setUp() {
        testAuditLog = new AuditLog();
        testAuditLog.setId(1L);
        testAuditLog.setUserId(100L);
        testAuditLog.setAction("USER_LOGIN");
        testAuditLog.setTimestamp(LocalDateTime.now());
        testAuditLog.setServiceName("java-backend");

        testNotification = new Notification();
        testNotification.setId(1L);
        testNotification.setUserId(100L);
        testNotification.setTitle("Test Notification");
        testNotification.setMessage("Test message");
        testNotification.setRead(false);

        testTicket = new SupportTicket();
        testTicket.setId(1L);
        testTicket.setUserId(100L);
        testTicket.setSubject("Test Issue");
        testTicket.setDescription("Test description");
        testTicket.setStatus("open");
        testTicket.setPriority("medium");
    }

    @Test
    void testCreateAuditLog() {
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testAuditLog);

        AuditLog result = systemService.createAuditLog(testAuditLog);

        assertNotNull(result);
        assertEquals("USER_LOGIN", result.getAction());
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    void testGetAuditLogById() {
        when(auditLogRepository.findById(1L)).thenReturn(Optional.of(testAuditLog));

        AuditLog result = systemService.getAuditLogById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(auditLogRepository, times(1)).findById(1L);
    }

    @Test
    void testGetAuditLogsByUserId() {
        List<AuditLog> logs = Arrays.asList(testAuditLog);
        Pageable pageable = PageRequest.of(0, 10);
        Page<AuditLog> page = new PageImpl<>(logs, pageable, logs.size());

        when(auditLogRepository.findByUserId(100L, pageable)).thenReturn(page);

        Page<AuditLog> result = systemService.getAuditLogsByUserId(100L, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(auditLogRepository, times(1)).findByUserId(100L, pageable);
    }

    @Test
    void testGetAuditLogsByServiceName() {
        List<AuditLog> logs = Arrays.asList(testAuditLog);
        when(auditLogRepository.findByServiceName("java-backend")).thenReturn(logs);

        List<AuditLog> result = systemService.getAuditLogsByServiceName("java-backend");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("java-backend", result.get(0).getServiceName());
    }

    @Test
    void testCreateNotification() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        Notification result = systemService.createNotification(testNotification);

        assertNotNull(result);
        assertEquals("Test Notification", result.getTitle());
        assertFalse(result.isRead());
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void testGetNotificationsByUserId() {
        List<Notification> notifications = Arrays.asList(testNotification);
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(100L)).thenReturn(notifications);

        List<Notification> result = systemService.getNotificationsByUserId(100L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(100L, result.get(0).getUserId());
    }

    @Test
    void testMarkNotificationAsRead() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        Notification result = systemService.markNotificationAsRead(1L);

        assertNotNull(result);
        assertTrue(result.isRead());
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void testGetUnreadNotificationCount() {
        when(notificationRepository.countByUserIdAndIsRead(100L, false)).thenReturn(5L);

        long count = systemService.getUnreadNotificationCount(100L);

        assertEquals(5L, count);
        verify(notificationRepository, times(1)).countByUserIdAndIsRead(100L, false);
    }

    @Test
    void testCreateSupportTicket() {
        when(supportTicketRepository.save(any(SupportTicket.class))).thenReturn(testTicket);

        SupportTicket result = systemService.createSupportTicket(testTicket);

        assertNotNull(result);
        assertEquals("Test Issue", result.getSubject());
        assertEquals("open", result.getStatus());
        verify(supportTicketRepository, times(1)).save(any(SupportTicket.class));
    }

    @Test
    void testGetSupportTicketById() {
        when(supportTicketRepository.findById(1L)).thenReturn(Optional.of(testTicket));

        Optional<SupportTicket> result = systemService.getSupportTicketById(1L);

        assertTrue(result.isPresent());
        assertEquals("Test Issue", result.get().getSubject());
    }

    @Test
    void testGetSupportTicketsByUserId() {
        List<SupportTicket> tickets = Arrays.asList(testTicket);
        when(supportTicketRepository.findByUserId(100L)).thenReturn(tickets);

        List<SupportTicket> result = systemService.getSupportTicketsByUserId(100L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(100L, result.get(0).getUserId());
    }

    @Test
    void testUpdateTicketStatus() {
        when(supportTicketRepository.findById(1L)).thenReturn(Optional.of(testTicket));
        when(supportTicketRepository.save(any(SupportTicket.class))).thenReturn(testTicket);

        SupportTicket result = systemService.updateTicketStatus(1L, "resolved");

        assertNotNull(result);
        assertEquals("resolved", result.getStatus());
        verify(supportTicketRepository, times(1)).save(any(SupportTicket.class));
    }

    @Test
    void testGetSystemConfig() {
        SystemConfig config = new SystemConfig();
        config.setConfigKey("app.name");
        config.setConfigValue("CRM System");

        when(systemConfigRepository.findByConfigKey("app.name")).thenReturn(Optional.of(config));

        Optional<SystemConfig> result = systemService.getSystemConfig("app.name");

        assertTrue(result.isPresent());
        assertEquals("CRM System", result.get().getConfigValue());
    }

    @Test
    void testCreateSecurityIncident() {
        SecurityIncident incident = new SecurityIncident();
        incident.setId(1L);
        incident.setIncidentType("UNAUTHORIZED_ACCESS");
        incident.setSeverity("high");

        when(securityIncidentRepository.save(any(SecurityIncident.class))).thenReturn(incident);

        SecurityIncident result = systemService.createSecurityIncident(incident);

        assertNotNull(result);
        assertEquals("UNAUTHORIZED_ACCESS", result.getIncidentType());
        assertEquals("high", result.getSeverity());
    }

    @Test
    void testGetAllSOPs() {
        SOP sop = new SOP();
        sop.setId(1L);
        sop.setTitle("Emergency Procedures");
        sop.setCategory("Safety");

        List<SOP> sops = Arrays.asList(sop);
        when(sopRepository.findAll()).thenReturn(sops);

        List<SOP> result = systemService.getAllSOPs();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Emergency Procedures", result.get(0).getTitle());
    }

    @Test
    void testGetSOPsByCategory() {
        SOP sop = new SOP();
        sop.setCategory("Safety");

        List<SOP> sops = Arrays.asList(sop);
        when(sopRepository.findByCategory("Safety")).thenReturn(sops);

        List<SOP> result = systemService.getSOPsByCategory("Safety");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Safety", result.get(0).getCategory());
    }
}
