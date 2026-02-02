package com.craftresourcemanagement;

import com.craftresourcemanagement.revenue.entities.RevenueCollection;
import com.craftresourcemanagement.revenue.entities.TaxAssessment;
import com.craftresourcemanagement.revenue.repositories.RevenueCollectionRepository;
import com.craftresourcemanagement.revenue.repositories.TaxAssessmentRepository;
import com.craftresourcemanagement.revenue.services.impl.RevenueServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RevenueServiceTest {

    @Mock
    private RevenueCollectionRepository revenueCollectionRepository;

    @Mock
    private TaxAssessmentRepository taxAssessmentRepository;

    @InjectMocks
    private RevenueServiceImpl revenueService;

    private RevenueCollection testRevenue;
    private TaxAssessment testTax;

    @BeforeEach
    void setUp() {
        testRevenue = new RevenueCollection();
        testRevenue.setPayerId("PAYER001");
        testRevenue.setAmountCollected(new BigDecimal("10000.00"));
        testRevenue.setPaymentMethod("CASH");

        testTax = new TaxAssessment();
        testTax.setStatus("ASSESSED");
    }

    @Test
    void testCreateRevenueCollection_Success() {
        when(revenueCollectionRepository.save(any(RevenueCollection.class))).thenReturn(testRevenue);

        RevenueCollection result = revenueService.createRevenueCollection(testRevenue);

        assertNotNull(result);
        verify(revenueCollectionRepository, times(1)).save(any(RevenueCollection.class));
    }



    @Test
    void testCreateTaxAssessment_Success() {
        when(taxAssessmentRepository.save(any(TaxAssessment.class))).thenReturn(testTax);

        TaxAssessment result = revenueService.createTaxAssessment(testTax);

        assertNotNull(result);
        assertEquals("ASSESSED", result.getStatus());
    }


}
