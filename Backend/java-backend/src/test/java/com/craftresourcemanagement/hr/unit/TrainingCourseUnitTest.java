package com.craftresourcemanagement.hr.unit;

import com.craftresourcemanagement.hr.entities.TrainingCourse;
import com.craftresourcemanagement.hr.repositories.TrainingCourseRepository;
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
class TrainingCourseUnitTest {

    @Mock
    private TrainingCourseRepository trainingCourseRepository;

    private TrainingCourse testCourse;

    @BeforeEach
    void setUp() {
        testCourse = new TrainingCourse();
        testCourse.setCourseName("Java Advanced");
        testCourse.setDescription("Advanced Java Programming");
        testCourse.setStartDate(LocalDate.now());
        testCourse.setEndDate(LocalDate.now().plusDays(30));
    }

    @Test
    void createTrainingCourse_Success() {
        when(trainingCourseRepository.save(any(TrainingCourse.class))).thenReturn(testCourse);
        TrainingCourse saved = trainingCourseRepository.save(testCourse);
        assertNotNull(saved);
        assertEquals("Java Advanced", saved.getCourseName());
        verify(trainingCourseRepository).save(any(TrainingCourse.class));
    }

    @Test
    void getAllTrainingCourses_Success() {
        when(trainingCourseRepository.findAll()).thenReturn(Arrays.asList(testCourse));
        List<TrainingCourse> courses = trainingCourseRepository.findAll();
        assertEquals(1, courses.size());
        verify(trainingCourseRepository).findAll();
    }

    @Test
    void getTrainingCourseById_Found() {
        when(trainingCourseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        Optional<TrainingCourse> found = trainingCourseRepository.findById(1L);
        assertTrue(found.isPresent());
        assertEquals("Java Advanced", found.get().getCourseName());
    }

    @Test
    void getTrainingCourseById_NotFound() {
        when(trainingCourseRepository.findById(999L)).thenReturn(Optional.empty());
        Optional<TrainingCourse> found = trainingCourseRepository.findById(999L);
        assertFalse(found.isPresent());
    }

    @Test
    void updateTrainingCourse_Success() {
        testCourse.setCourseName("Java Expert");
        when(trainingCourseRepository.save(any(TrainingCourse.class))).thenReturn(testCourse);
        TrainingCourse updated = trainingCourseRepository.save(testCourse);
        assertEquals("Java Expert", updated.getCourseName());
    }

    @Test
    void deleteTrainingCourse_Success() {
        doNothing().when(trainingCourseRepository).deleteById(1L);
        trainingCourseRepository.deleteById(1L);
        verify(trainingCourseRepository).deleteById(1L);
    }
}
