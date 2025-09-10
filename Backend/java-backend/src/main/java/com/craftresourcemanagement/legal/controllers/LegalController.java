package com.craftresourcemanagement.legal.controllers;

import com.craftresourcemanagement.legal.entities.LegalCase;
import com.craftresourcemanagement.legal.entities.ComplianceRecord;
import com.craftresourcemanagement.legal.services.LegalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/legal")
public class LegalController {

    private final LegalService legalService;

    public LegalController(LegalService legalService) {
        this.legalService = legalService;
    }

    // LegalCase endpoints
    @PostMapping("/cases")
    public ResponseEntity<LegalCase> createLegalCase(@RequestBody LegalCase legalCase) {
        return ResponseEntity.ok(legalService.createLegalCase(legalCase));
    }

    @GetMapping("/cases")
    public ResponseEntity<List<LegalCase>> getAllLegalCases() {
        return ResponseEntity.ok(legalService.getAllLegalCases());
    }

    @GetMapping("/cases/{id}")
    public ResponseEntity<LegalCase> getLegalCaseById(@PathVariable Long id) {
        LegalCase legalCase = legalService.getLegalCaseById(id);
        if (legalCase == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(legalCase);
    }

    @PutMapping("/cases/{id}")
    public ResponseEntity<LegalCase> updateLegalCase(@PathVariable Long id, @RequestBody LegalCase legalCase) {
        LegalCase updated = legalService.updateLegalCase(id, legalCase);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/cases/{id}")
    public ResponseEntity<Void> deleteLegalCase(@PathVariable Long id) {
        legalService.deleteLegalCase(id);
        return ResponseEntity.noContent().build();
    }

    // ComplianceRecord endpoints
    @PostMapping("/compliance-records")
    public ResponseEntity<ComplianceRecord> createComplianceRecord(@RequestBody ComplianceRecord complianceRecord) {
        return ResponseEntity.ok(legalService.createComplianceRecord(complianceRecord));
    }

    @GetMapping("/compliance-records")
    public ResponseEntity<List<ComplianceRecord>> getAllComplianceRecords() {
        return ResponseEntity.ok(legalService.getAllComplianceRecords());
    }

    @GetMapping("/compliance-records/{id}")
    public ResponseEntity<ComplianceRecord> getComplianceRecordById(@PathVariable Long id) {
        ComplianceRecord record = legalService.getComplianceRecordById(id);
        if (record == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(record);
    }

    @PutMapping("/compliance-records/{id}")
    public ResponseEntity<ComplianceRecord> updateComplianceRecord(@PathVariable Long id, @RequestBody ComplianceRecord complianceRecord) {
        ComplianceRecord updated = legalService.updateComplianceRecord(id, complianceRecord);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/compliance-records/{id}")
    public ResponseEntity<Void> deleteComplianceRecord(@PathVariable Long id) {
        legalService.deleteComplianceRecord(id);
        return ResponseEntity.noContent().build();
    }
}
