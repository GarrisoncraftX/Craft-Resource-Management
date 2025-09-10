package com.craftresourcemanagement.legal.services;

import com.craftresourcemanagement.legal.entities.LegalCase;
import com.craftresourcemanagement.legal.entities.ComplianceRecord;

import java.util.List;

public interface LegalService {

    // LegalCase
    LegalCase createLegalCase(LegalCase legalCase);
    List<LegalCase> getAllLegalCases();
    LegalCase getLegalCaseById(Long id);
    LegalCase updateLegalCase(Long id, LegalCase legalCase);
    void deleteLegalCase(Long id);

    // ComplianceRecord
    ComplianceRecord createComplianceRecord(ComplianceRecord complianceRecord);
    List<ComplianceRecord> getAllComplianceRecords();
    ComplianceRecord getComplianceRecordById(Long id);
    ComplianceRecord updateComplianceRecord(Long id, ComplianceRecord complianceRecord);
    void deleteComplianceRecord(Long id);
}
