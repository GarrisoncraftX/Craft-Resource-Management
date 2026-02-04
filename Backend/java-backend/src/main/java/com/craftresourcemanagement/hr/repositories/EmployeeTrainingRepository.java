package com.craftresourcemanagement.hr.repositories;

import com.craftresourcemanagement.hr.entities.EmployeeTraining;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EmployeeTrainingRepository extends JpaRepository<EmployeeTraining, Long> {
    long countByEnrollmentDateAfter(LocalDate enrollmentDate);
    
    @Query("SELECT et FROM EmployeeTraining et JOIN et.trainingCourse tc WHERE tc.endDate = ?1 AND et.completionDate IS NULL")
    List<EmployeeTraining> findIncompleteTrainingsEndingOn(LocalDate date);
}
