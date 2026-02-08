package com.craftresourcemanagement.hr.unit;

import com.craftresourcemanagement.hr.entities.PerformanceReview;
import com.craftresourcemanagement.hr.repositories.PerformanceReviewRepository;
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
class PerformanceReviewUnitTest {

    @Mock
    private PerformanceReviewRepository performanceReviewRepository;

    private PerformanceReview testReview;

    @BeforeEach
    void setUp() {
        testReview = new PerformanceReview();
        testReview.setEmployeeId(1L);
        testReview.setReviewerId(2L);
        testReview.setReviewDate(LocalDate.now());
        testReview.setRating(4.5);
        testReview.setStatus("PENDING");
    }

    @Test
    void createPerformanceReview_Success() {
        when(performanceReviewRepository.save(any(PerformanceReview.class))).thenReturn(testReview);
        PerformanceReview saved = performanceReviewRepository.save(testReview);
        assertNotNull(saved);
        assertEquals(4.5, saved.getRating());
        verify(performanceReviewRepository).save(any(PerformanceReview.class));
    }

    @Test
    void getAllPerformanceReviews_Success() {
        when(performanceReviewRepository.findAll()).thenReturn(Arrays.asList(testReview));
        List<PerformanceReview> reviews = performanceReviewRepository.findAll();
        assertEquals(1, reviews.size());
    }

    @Test
    void getPerformanceReviewById_Found() {
        when(performanceReviewRepository.findById(1L)).thenReturn(Optional.of(testReview));
        Optional<PerformanceReview> found = performanceReviewRepository.findById(1L);
        assertTrue(found.isPresent());
        assertEquals("PENDING", found.get().getStatus());
    }

    @Test
    void getPerformanceReviewById_NotFound() {
        when(performanceReviewRepository.findById(999L)).thenReturn(Optional.empty());
        Optional<PerformanceReview> found = performanceReviewRepository.findById(999L);
        assertFalse(found.isPresent());
    }

    @Test
    void updatePerformanceReview_Success() {
        testReview.setStatus("COMPLETED");
        testReview.setRating(5.0);
        when(performanceReviewRepository.save(any(PerformanceReview.class))).thenReturn(testReview);
        PerformanceReview updated = performanceReviewRepository.save(testReview);
        assertEquals("COMPLETED", updated.getStatus());
        assertEquals(5.0, updated.getRating());
    }

    @Test
    void deletePerformanceReview_Success() {
        doNothing().when(performanceReviewRepository).deleteById(1L);
        performanceReviewRepository.deleteById(1L);
        verify(performanceReviewRepository).deleteById(1L);
    }

    @Test
    void countByStatus_Success() {
        when(performanceReviewRepository.countByStatus("PENDING")).thenReturn(5L);
        long count = performanceReviewRepository.countByStatus("PENDING");
        assertEquals(5L, count);
    }
}
