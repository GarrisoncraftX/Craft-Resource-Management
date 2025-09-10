package com.craftresourcemanagement.legal.repositories;

import com.craftresourcemanagement.legal.entities.LegalCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LegalCaseRepository extends JpaRepository<LegalCase, Long> {
}
