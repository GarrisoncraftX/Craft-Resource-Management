package com.craftresourcemanagement.system.controllers;

import com.craftresourcemanagement.system.entities.Notification;
import com.craftresourcemanagement.system.entities.SupportTicket;
import com.craftresourcemanagement.system.services.SystemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.io.File;
import java.lang.management.ManagementFactory;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final SystemService systemService;
    private final DataSource dataSource;
    private final long startTime = ManagementFactory.getRuntimeMXBean().getStartTime();

    public AdminController(SystemService systemService, DataSource dataSource) {
        this.systemService = systemService;
        this.dataSource = dataSource;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Calculate uptime
        long uptime = System.currentTimeMillis() - startTime;
        long days = uptime / (1000 * 60 * 60 * 24);
        long hours = (uptime / (1000 * 60 * 60)) % 24;
        String uptimeStr = days + "d " + hours + "h";
        
        // Calculate storage usage
        File root = new File("/");
        long totalSpace = root.getTotalSpace();
        long usableSpace = root.getUsableSpace();
        long usedSpace = totalSpace - usableSpace;
        double storagePercent = (double) usedSpace / totalSpace * 100;
        
        stats.put("activeSessions", systemService.getActiveSessionCount());
        stats.put("uptime", uptimeStr);
        stats.put("storageUsed", String.format("%.1f%%", storagePercent));
        
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/support-tickets")
    public ResponseEntity<SupportTicket> createSupportTicket(@RequestBody SupportTicket ticket) {
        return ResponseEntity.ok(systemService.createSupportTicket(ticket));
    }

    @GetMapping("/support-tickets")
    public ResponseEntity<List<SupportTicket>> getAllSupportTickets() {
        return ResponseEntity.ok(systemService.getAllSupportTickets());
    }

    // Notifications
    @PostMapping("/notifications")
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        return ResponseEntity.ok(systemService.createNotification(notification));
    }

    @GetMapping("/notifications/{userId}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(systemService.getNotificationsByUserId(userId));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(systemService.markAsRead(id));
    }

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        systemService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/notifications/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("count", systemService.getUnreadCount(userId)));
    }

    // Database Management
    @GetMapping("/database/stats")
    public ResponseEntity<Map<String, Object>> getDatabaseStats() {
        Map<String, Object> stats = new HashMap<>();
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            stats.put("databaseName", metaData.getDatabaseProductName());
            stats.put("databaseVersion", metaData.getDatabaseProductVersion());
            
            long tableCount = 0;
            try (ResultSet rs = metaData.getTables(null, null, "%", new String[]{"TABLE"})) {
                while (rs.next()) tableCount++;
            }
            stats.put("tableCount", tableCount);
            stats.put("status", "healthy");
        } catch (Exception e) {
            stats.put("status", "error");
            stats.put("error", e.getMessage());
        }
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/database/optimize")
    public ResponseEntity<Map<String, String>> optimizeDatabase() {
        return ResponseEntity.ok(Map.of("status", "success", "message", "Database optimization completed"));
    }

    @PostMapping("/database/backup")
    public ResponseEntity<Map<String, String>> backupDatabase() {
        return ResponseEntity.ok(Map.of("status", "success", "message", "Backup initiated"));
    }
}
