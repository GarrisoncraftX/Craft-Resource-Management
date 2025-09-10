package com.craftresourcemanagement.hr.repositories;

import com.craftresourcemanagement.hr.entities.EmployeeTraining;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeTrainingRepository extends JpaRepository<EmployeeTraining, Long> {
}
