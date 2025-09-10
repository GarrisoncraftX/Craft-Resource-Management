package com.craftresourcemanagement.hr.repositories;

import com.craftresourcemanagement.hr.entities.BenefitPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BenefitPlanRepository extends JpaRepository<BenefitPlan, Long> {
}
