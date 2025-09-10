package com.craftresourcemanagement.legal.repositories;

import com.craftresourcemanagement.legal.entities.ComplianceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComplianceRecordRepository extends JpaRepository<ComplianceRecord, Long> {
}
