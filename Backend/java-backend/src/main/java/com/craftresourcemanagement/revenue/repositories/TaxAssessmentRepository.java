package com.craftresourcemanagement.revenue.repositories;

import com.craftresourcemanagement.revenue.entities.TaxAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaxAssessmentRepository extends JpaRepository<TaxAssessment, Long> {
}
