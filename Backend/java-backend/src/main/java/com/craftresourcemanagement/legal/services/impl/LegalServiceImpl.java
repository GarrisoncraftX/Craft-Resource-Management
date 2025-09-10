package com.craftresourcemanagement.legal.services.impl;

import com.craftresourcemanagement.legal.entities.LegalCase;
import com.craftresourcemanagement.legal.entities.ComplianceRecord;
import com.craftresourcemanagement.legal.repositories.LegalCaseRepository;
import com.craftresourcemanagement.legal.repositories.ComplianceRecordRepository;
import com.craftresourcemanagement.legal.services.LegalService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LegalServiceImpl implements LegalService {

    private final LegalCaseRepository legalCaseRepository;
    private final ComplianceRecordRepository complianceRecordRepository;

    public LegalServiceImpl(LegalCaseRepository legalCaseRepository,
                            ComplianceRecordRepository complianceRecordRepository) {
        this.legalCaseRepository = legalCaseRepository;
        this.complianceRecordRepository = complianceRecordRepository;
    }

    // LegalCase
    @Override
    public LegalCase createLegalCase(LegalCase legalCase) {
        return legalCaseRepository.save(legalCase);
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
            return legalCaseRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deleteLegalCase(Long id) {
        legalCaseRepository.deleteById(id);
    }

    // ComplianceRecord
    @Override
    public ComplianceRecord createComplianceRecord(ComplianceRecord complianceRecord) {
        return complianceRecordRepository.save(complianceRecord);
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
            return complianceRecordRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deleteComplianceRecord(Long id) {
        complianceRecordRepository.deleteById(id);
    }
}
