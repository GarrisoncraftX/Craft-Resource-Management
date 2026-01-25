package com.craftresourcemanagement.legal.services.impl;

import com.craftresourcemanagement.legal.entities.LegalCase;
import com.craftresourcemanagement.legal.entities.ComplianceRecord;
import com.craftresourcemanagement.legal.repositories.LegalCaseRepository;
import com.craftresourcemanagement.legal.repositories.ComplianceRecordRepository;
import com.craftresourcemanagement.legal.services.LegalService;
import com.craftresourcemanagement.utils.AuditClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LegalServiceImpl implements LegalService {

    private final LegalCaseRepository legalCaseRepository;
    private final ComplianceRecordRepository complianceRecordRepository;
    private final AuditClient auditClient;

    public LegalServiceImpl(LegalCaseRepository legalCaseRepository,
                            ComplianceRecordRepository complianceRecordRepository,
                            AuditClient auditClient) {
        this.legalCaseRepository = legalCaseRepository;
        this.complianceRecordRepository = complianceRecordRepository;
        this.auditClient = auditClient;
    }

    // LegalCase
    @Override
    public LegalCase createLegalCase(LegalCase legalCase) {
        LegalCase saved = legalCaseRepository.save(legalCase);
        auditClient.logAction(null, "CREATE_LEGAL_CASE", "Case: " + saved.getCaseNumber());
        return saved;
    }

    @Override
    public List<LegalCase> getAllLegalCases() {
        return legalCaseRepository.findAll();
    }

    @Override
    public LegalCase getLegalCaseById(Long id) {
        return legalCaseRepository.findById(id).orElse(null);
    }

    @Override
    public LegalCase updateLegalCase(Long id, LegalCase legalCase) {
        Optional<LegalCase> existing = legalCaseRepository.findById(id);
        if (existing.isPresent()) {
            LegalCase toUpdate = existing.get();
            toUpdate.setCaseNumber(legalCase.getCaseNumber());
            toUpdate.setTitle(legalCase.getTitle());
            toUpdate.setDescription(legalCase.getDescription());
            toUpdate.setStartDate(legalCase.getStartDate());
            toUpdate.setEndDate(legalCase.getEndDate());
            toUpdate.setStatus(legalCase.getStatus());
            toUpdate.setAssignedTo(legalCase.getAssignedTo());
            LegalCase updated = legalCaseRepository.save(toUpdate);
            auditClient.logAction(null, "UPDATE_LEGAL_CASE", "Case: " + updated.getCaseNumber() + ", Status: " + updated.getStatus());
            return updated;
        }
        return null;
    }

    @Override
    public void deleteLegalCase(Long id) {
        legalCaseRepository.findById(id).ifPresent(legalCase -> 
            auditClient.logAction(null, "DELETE_LEGAL_CASE", "Case: " + legalCase.getCaseNumber())
        );
        legalCaseRepository.deleteById(id);
    }

    // ComplianceRecord
    @Override
    public ComplianceRecord createComplianceRecord(ComplianceRecord complianceRecord) {
        ComplianceRecord saved = complianceRecordRepository.save(complianceRecord);
        auditClient.logAction(null, "CREATE_COMPLIANCE_RECORD", "Type: " + saved.getComplianceType() + ", Responsible: " + saved.getResponsiblePerson());
        return saved;
    }

    @Override
    public List<ComplianceRecord> getAllComplianceRecords() {
        return complianceRecordRepository.findAll();
    }

    @Override
    public ComplianceRecord getComplianceRecordById(Long id) {
        return complianceRecordRepository.findById(id).orElse(null);
    }

    @Override
    public ComplianceRecord updateComplianceRecord(Long id, ComplianceRecord complianceRecord) {
        Optional<ComplianceRecord> existing = complianceRecordRepository.findById(id);
        if (existing.isPresent()) {
            ComplianceRecord toUpdate = existing.get();
            toUpdate.setComplianceType(complianceRecord.getComplianceType());
            toUpdate.setComplianceDate(complianceRecord.getComplianceDate());
            toUpdate.setDescription(complianceRecord.getDescription());
            toUpdate.setResponsiblePerson(complianceRecord.getResponsiblePerson());
            ComplianceRecord updated = complianceRecordRepository.save(toUpdate);
            auditClient.logAction(null, "UPDATE_COMPLIANCE_RECORD", "Type: " + updated.getComplianceType() + ", Responsible: " + updated.getResponsiblePerson());
            return updated;
        }
        return null;
    }

    @Override
    public void deleteComplianceRecord(Long id) {
        complianceRecordRepository.deleteById(id);
    }
}
