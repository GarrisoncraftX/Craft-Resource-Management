package com.craftresourcemanagement.hr.controllers;

import com.craftresourcemanagement.hr.entities.EmployeeOffboarding;
import com.craftresourcemanagement.hr.repositories.EmployeeOffboardingRepository;
import com.craftresourcemanagement.utils.AuditClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/hr/offboarding")
public class OffboardingController {

    private final EmployeeOffboardingRepository offboardingRepository;
    private final AuditClient auditClient;

    public OffboardingController(EmployeeOffboardingRepository offboardingRepository, AuditClient auditClient) {
        this.offboardingRepository = offboardingRepository;
        this.auditClient = auditClient;
    }

    @PostMapping
    public ResponseEntity<EmployeeOffboarding> initiateOffboarding(@RequestBody EmployeeOffboarding offboarding) {
        EmployeeOffboarding saved = offboardingRepository.save(offboarding);
        auditClient.logActionAsync(saved.getUserId(), "initiated offboarding",
            String.format("{\"module\":\"offboarding\",\"operation\":\"CREATE\",\"type\":\"%s\"}", saved.getOffboardingType()),
            "java-backend", "OFFBOARDING", saved.getId().toString());
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<EmployeeOffboarding>> getAllOffboarding() {
        return ResponseEntity.ok(offboardingRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeOffboarding> getOffboardingById(@PathVariable Long id) {
        return offboardingRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<EmployeeOffboarding> getOffboardingByUserId(@PathVariable Long userId) {
        return offboardingRepository.findByUserId(userId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeOffboarding> updateOffboarding(@PathVariable Long id, @RequestBody EmployeeOffboarding offboarding) {
        return offboardingRepository.findById(id)
            .map(existing -> {
                existing.setStatus(offboarding.getStatus());
                existing.setExitInterviewScheduled(offboarding.getExitInterviewScheduled());
                existing.setExitInterviewDate(offboarding.getExitInterviewDate());
                existing.setAssetsReturned(offboarding.getAssetsReturned());
                existing.setClearanceCompleted(offboarding.getClearanceCompleted());
                existing.setFinalSettlementAmount(offboarding.getFinalSettlementAmount());
                existing.setFinalSettlementPaid(offboarding.getFinalSettlementPaid());
                existing.setAccessRevoked(offboarding.getAccessRevoked());
                EmployeeOffboarding updated = offboardingRepository.save(existing);
                auditClient.logActionAsync(updated.getUserId(), "updated offboarding",
                    String.format("{\"module\":\"offboarding\",\"operation\":\"UPDATE\",\"status\":\"%s\"}", updated.getStatus()),
                    "java-backend", "OFFBOARDING", id.toString());
                return ResponseEntity.ok(updated);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<EmployeeOffboarding> completeOffboarding(@PathVariable Long id) {
        return offboardingRepository.findById(id)
            .map(offboarding -> {
                offboarding.setStatus("COMPLETED");
                EmployeeOffboarding updated = offboardingRepository.save(offboarding);
                auditClient.logActionAsync(updated.getUserId(), "completed offboarding",
                    String.format("{\"module\":\"offboarding\",\"operation\":\"COMPLETE\",\"id\":%d}", id),
                    "java-backend", "OFFBOARDING", id.toString());
                return ResponseEntity.ok(updated);
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
