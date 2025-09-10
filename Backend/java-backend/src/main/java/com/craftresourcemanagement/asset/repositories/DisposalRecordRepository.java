package com.craftresourcemanagement.asset.repositories;

import com.craftresourcemanagement.asset.entities.DisposalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DisposalRecordRepository extends JpaRepository<DisposalRecord, Long> {
}
