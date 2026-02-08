package com.craftresourcemanagement.hr.repositories;

import com.craftresourcemanagement.hr.entities.EmployeeOffboarding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeOffboardingRepository extends JpaRepository<EmployeeOffboarding, Long> {
    List<EmployeeOffboarding> findByStatus(String status);
    Optional<EmployeeOffboarding> findByUserId(Long userId);
    List<EmployeeOffboarding> findByAccessRevokedFalse();
}
