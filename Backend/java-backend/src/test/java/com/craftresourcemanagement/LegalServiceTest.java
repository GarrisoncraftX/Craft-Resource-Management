package com.craftresourcemanagement;

import com.craftresourcemanagement.legal.entities.LegalCase;
import com.craftresourcemanagement.legal.entities.ComplianceRecord;
import com.craftresourcemanagement.legal.repositories.LegalCaseRepository;
import com.craftresourcemanagement.legal.repositories.ComplianceRecordRepository;
import com.craftresourcemanagement.legal.services.impl.LegalServiceImpl;
import com.craftresourcemanagement.utils.AuditClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;



import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LegalServiceTest {

    @Mock
    private LegalCaseRepository legalCaseRepository;

    @Mock
    private ComplianceRecordRepository complianceRecordRepository;

    @Mock
    private AuditClient auditClient;

    @InjectMocks
    private LegalServiceImpl legalService;

    private LegalCase testCase;
    private ComplianceRecord testCompliance;

    @BeforeEach
    void setUp() {
        testCase = new LegalCase();
        testCase.setCaseNumber("CASE001");
        testCase.setStatus("OPEN");

        testCompliance = new ComplianceRecord();
        testCompliance.setComplianceType("GDPR");
    }

    @Test
    void testCreateLegalCase_Success() {
        when(legalCaseRepository.save(any(LegalCase.class))).thenReturn(testCase);

        LegalCase result = legalService.createLegalCase(testCase);

        assertNotNull(result);
        assertEquals("CASE001", result.getCaseNumber());
    }





    @Test
    void testCreateComplianceRecord_Success() {
        when(complianceRecordRepository.save(any(ComplianceRecord.class))).thenReturn(testCompliance);

        ComplianceRecord result = legalService.createComplianceRecord(testCompliance);

        assertNotNull(result);
        assertEquals("GDPR", result.getComplianceType());
    }
}
