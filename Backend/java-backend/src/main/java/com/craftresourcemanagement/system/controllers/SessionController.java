package com.craftresourcemanagement.system.controllers;

import com.craftresourcemanagement.system.entities.ActiveSession;
import com.craftresourcemanagement.system.services.SystemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/sessions")
public class SessionController {

    private final SystemService systemService;

    public SessionController(SystemService systemService) {
        this.systemService = systemService;
    }

    @PostMapping
    public ResponseEntity<ActiveSession> createOrUpdateSession(@RequestBody ActiveSession session) {
        return ResponseEntity.ok(systemService.createOrUpdateSession(session));
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable String sessionId) {
        systemService.deleteSession(sessionId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/cleanup")
    public ResponseEntity<Void> cleanupSessions(@RequestParam(defaultValue = "30") int timeoutMinutes) {
        systemService.cleanupInactiveSessions(timeoutMinutes);
        return ResponseEntity.ok().build();
    }
}
