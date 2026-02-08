package com.craftresourcemanagement.hr.repositories;

import com.craftresourcemanagement.hr.entities.JobGrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobGradeRepository extends JpaRepository<JobGrade, Integer> {
}
