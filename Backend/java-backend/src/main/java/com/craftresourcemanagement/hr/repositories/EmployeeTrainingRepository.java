package com.craftresourcemanagement.hr.repositories;

import com.craftresourcemanagement.hr.entities.EmployeeTraining;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface EmployeeTrainingRepository extends JpaRepository<EmployeeTraining, Long> {
    long countByStartDateAfter(LocalDateTime startDate);
}
