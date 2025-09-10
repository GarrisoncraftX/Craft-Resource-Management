package com.craftresourcemanagement.finance.controllers;

import com.craftresourcemanagement.finance.entities.JournalEntry;
import com.craftresourcemanagement.finance.services.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/journal-entries")
@CrossOrigin(origins = "*")
public class JournalEntryController {

    @Autowired
    private FinanceService financeService;

    @GetMapping
    public ResponseEntity<List<JournalEntry>> getAllJournalEntries() {
        List<JournalEntry> journalEntries = financeService.getAllJournalEntries();
        return ResponseEntity.ok(journalEntries);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JournalEntry> getJournalEntryById(@PathVariable Long id) {
        JournalEntry journalEntry = financeService.getJournalEntryById(id);
        if (journalEntry != null) {
            return ResponseEntity.ok(journalEntry);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<JournalEntry> createJournalEntry(@RequestBody JournalEntry journalEntry) {
        try {
            JournalEntry createdEntry = financeService.createJournalEntry(journalEntry);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdEntry);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<JournalEntry> updateJournalEntry(
            @PathVariable Long id,
            @RequestBody JournalEntry journalEntry) {
        try {
            JournalEntry updatedEntry = financeService.updateJournalEntry(id, journalEntry);
            if (updatedEntry != null) {
                return ResponseEntity.ok(updatedEntry);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJournalEntry(@PathVariable Long id) {
        try {
            financeService.deleteJournalEntry(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
