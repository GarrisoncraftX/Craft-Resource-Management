package com.craftresourcemanagement.hr.repositories;

import com.craftresourcemanagement.hr.entities.EmployeeBenefit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeBenefitRepository extends JpaRepository<EmployeeBenefit, Long> {
}
