package com.craftresourcemanagement.hr.repositories;

import com.craftresourcemanagement.hr.entities.TrainingCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainingCourseRepository extends JpaRepository<TrainingCourse, Long> {
}
