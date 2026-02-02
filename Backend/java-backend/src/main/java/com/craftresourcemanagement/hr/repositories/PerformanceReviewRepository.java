package com.craftresourcemanagement.hr.repositories;

import com.craftresourcemanagement.hr.entities.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {
    long countByStatus(String status);
}
