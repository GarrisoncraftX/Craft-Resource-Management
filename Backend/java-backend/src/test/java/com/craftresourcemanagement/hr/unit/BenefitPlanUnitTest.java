package com.craftresourcemanagement.hr.unit;

import com.craftresourcemanagement.hr.entities.BenefitPlan;
import com.craftresourcemanagement.hr.repositories.BenefitPlanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BenefitPlanUnitTest {

    @Mock
    private BenefitPlanRepository benefitPlanRepository;

    private BenefitPlan testPlan;

    @BeforeEach
    void setUp() {
        testPlan = new BenefitPlan();
        testPlan.setPlanName("Health Insurance");
        testPlan.setDescription("Comprehensive health coverage");
        testPlan.setContributionAmount(new BigDecimal("500.00"));
    }

    @Test
    void createBenefitPlan_Success() {
        when(benefitPlanRepository.save(any(BenefitPlan.class))).thenReturn(testPlan);
        BenefitPlan saved = benefitPlanRepository.save(testPlan);
        assertNotNull(saved);
        assertEquals("Health Insurance", saved.getPlanName());
        verify(benefitPlanRepository).save(any(BenefitPlan.class));
    }

    @Test
    void getAllBenefitPlans_Success() {
        when(benefitPlanRepository.findAll()).thenReturn(Arrays.asList(testPlan));
        List<BenefitPlan> plans = benefitPlanRepository.findAll();
        assertEquals(1, plans.size());
    }

    @Test
    void getBenefitPlanById_Found() {
        when(benefitPlanRepository.findById(1L)).thenReturn(Optional.of(testPlan));
        Optional<BenefitPlan> found = benefitPlanRepository.findById(1L);
        assertTrue(found.isPresent());
        assertEquals("Health Insurance", found.get().getPlanName());
    }

    @Test
    void getBenefitPlanById_NotFound() {
        when(benefitPlanRepository.findById(999L)).thenReturn(Optional.empty());
        Optional<BenefitPlan> found = benefitPlanRepository.findById(999L);
        assertFalse(found.isPresent());
    }

    @Test
    void updateBenefitPlan_Success() {
        testPlan.setContributionAmount(new BigDecimal("600.00"));
        when(benefitPlanRepository.save(any(BenefitPlan.class))).thenReturn(testPlan);
        BenefitPlan updated = benefitPlanRepository.save(testPlan);
        assertEquals(new BigDecimal("600.00"), updated.getContributionAmount());
    }

    @Test
    void deleteBenefitPlan_Success() {
        doNothing().when(benefitPlanRepository).deleteById(1L);
        benefitPlanRepository.deleteById(1L);
        verify(benefitPlanRepository).deleteById(1L);
    }
}
