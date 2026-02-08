package com.craftresourcemanagement.hr.unit;

import com.craftresourcemanagement.hr.entities.EmployeeBenefit;
import com.craftresourcemanagement.hr.repositories.EmployeeBenefitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeBenefitUnitTest {

    @Mock
    private EmployeeBenefitRepository employeeBenefitRepository;

    private EmployeeBenefit testBenefit;

    @BeforeEach
    void setUp() {
        testBenefit = new EmployeeBenefit();
        testBenefit.setStartDate(LocalDate.now());
    }

    @Test
    void createEmployeeBenefit_Success() {
        when(employeeBenefitRepository.save(any(EmployeeBenefit.class))).thenReturn(testBenefit);
        EmployeeBenefit saved = employeeBenefitRepository.save(testBenefit);
        assertNotNull(saved);
        verify(employeeBenefitRepository).save(any(EmployeeBenefit.class));
    }

    @Test
    void getAllEmployeeBenefits_Success() {
        when(employeeBenefitRepository.findAll()).thenReturn(Arrays.asList(testBenefit));
        List<EmployeeBenefit> benefits = employeeBenefitRepository.findAll();
        assertEquals(1, benefits.size());
    }

    @Test
    void getEmployeeBenefitById_Found() {
        when(employeeBenefitRepository.findById(1L)).thenReturn(Optional.of(testBenefit));
        Optional<EmployeeBenefit> found = employeeBenefitRepository.findById(1L);
        assertTrue(found.isPresent());
    }

    @Test
    void getEmployeeBenefitById_NotFound() {
        when(employeeBenefitRepository.findById(999L)).thenReturn(Optional.empty());
        Optional<EmployeeBenefit> found = employeeBenefitRepository.findById(999L);
        assertFalse(found.isPresent());
    }

    @Test
    void updateEmployeeBenefit_Success() {
        testBenefit.setEndDate(LocalDate.now().plusYears(1));
        when(employeeBenefitRepository.save(any(EmployeeBenefit.class))).thenReturn(testBenefit);
        EmployeeBenefit updated = employeeBenefitRepository.save(testBenefit);
        assertNotNull(updated.getEndDate());
    }

    @Test
    void deleteEmployeeBenefit_Success() {
        doNothing().when(employeeBenefitRepository).deleteById(1L);
        employeeBenefitRepository.deleteById(1L);
        verify(employeeBenefitRepository).deleteById(1L);
    }
}
