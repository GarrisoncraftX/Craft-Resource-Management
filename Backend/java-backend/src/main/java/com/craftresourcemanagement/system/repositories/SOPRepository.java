package com.craftresourcemanagement.system.repositories;

import com.craftresourcemanagement.system.entities.SOP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SOPRepository extends JpaRepository<SOP, Long> {
    List<SOP> findByCategory(String category);
}
