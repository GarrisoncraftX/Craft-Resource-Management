package com.craftresourcemanagement.system.repositories;

import com.craftresourcemanagement.system.entities.SOP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SOPRepository extends JpaRepository<SOP, Long> {
}
