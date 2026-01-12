package com.craftresourcemanagement.system.controllers;

import com.craftresourcemanagement.system.entities.SupportTicket;
import com.craftresourcemanagement.system.services.SystemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final SystemService systemService;

    public AdminController(SystemService systemService) {
        this.systemService = systemService;
    }

    @PostMapping("/support-tickets")
    public ResponseEntity<SupportTicket> createSupportTicket(@RequestBody SupportTicket ticket) {
        return ResponseEntity.ok(systemService.createSupportTicket(ticket));
    }

    @GetMapping("/support-tickets")
    public ResponseEntity<List<SupportTicket>> getAllSupportTickets() {
        return ResponseEntity.ok(systemService.getAllSupportTickets());
    }
}
