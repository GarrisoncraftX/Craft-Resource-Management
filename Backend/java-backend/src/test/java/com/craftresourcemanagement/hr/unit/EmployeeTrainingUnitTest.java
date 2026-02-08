package com.craftresourcemanagement.hr.unit;

import com.craftresourcemanagement.hr.entities.EmployeeTraining;
import com.craftresourcemanagement.hr.repositories.EmployeeTrainingRepository;
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
class EmployeeTrainingUnitTest {

    @Mock
    private EmployeeTrainingRepository employeeTrainingRepository;

    private EmployeeTraining testTraining;

    @BeforeEach
    void setUp() {
        testTraining = new EmployeeTraining();
        testTraining.setEnrollmentDate(LocalDate.now());
    }

    @Test
    void createEmployeeTraining_Success() {
        when(employeeTrainingRepository.save(any(EmployeeTraining.class))).thenReturn(testTraining);
        EmployeeTraining saved = employeeTrainingRepository.save(testTraining);
        assertNotNull(saved);
        verify(employeeTrainingRepository).save(any(EmployeeTraining.class));
    }

    @Test
    void getAllEmployeeTrainings_Success() {
        when(employeeTrainingRepository.findAll()).thenReturn(Arrays.asList(testTraining));
        List<EmployeeTraining> trainings = employeeTrainingRepository.findAll();
        assertEquals(1, trainings.size());
    }

    @Test
    void getEmployeeTrainingById_Found() {
        when(employeeTrainingRepository.findById(1L)).thenReturn(Optional.of(testTraining));
        Optional<EmployeeTraining> found = employeeTrainingRepository.findById(1L);
        assertTrue(found.isPresent());
    }

    @Test
    void getEmployeeTrainingById_NotFound() {
        when(employeeTrainingRepository.findById(999L)).thenReturn(Optional.empty());
        Optional<EmployeeTraining> found = employeeTrainingRepository.findById(999L);
        assertFalse(found.isPresent());
    }

    @Test
    void updateEmployeeTraining_Success() {
        testTraining.setCompletionDate(LocalDate.now());
        when(employeeTrainingRepository.save(any(EmployeeTraining.class))).thenReturn(testTraining);
        EmployeeTraining updated = employeeTrainingRepository.save(testTraining);
        assertNotNull(updated.getCompletionDate());
    }

    @Test
    void deleteEmployeeTraining_Success() {
        doNothing().when(employeeTrainingRepository).deleteById(1L);
        employeeTrainingRepository.deleteById(1L);
        verify(employeeTrainingRepository).deleteById(1L);
    }

    @Test
    void findIncompleteTrainingsEndingOn_Success() {
        LocalDate endDate = LocalDate.now().plusDays(7);
        when(employeeTrainingRepository.findIncompleteTrainingsEndingOn(endDate))
                .thenReturn(Arrays.asList(testTraining));
        List<EmployeeTraining> trainings = employeeTrainingRepository.findIncompleteTrainingsEndingOn(endDate);
        assertEquals(1, trainings.size());
    }
}
