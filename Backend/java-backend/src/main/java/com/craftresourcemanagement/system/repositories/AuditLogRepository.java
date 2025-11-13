package com.craftresourcemanagement.system.repositories;

import com.craftresourcemanagement.system.entities.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop4ByPerformedByOrderByTimestampDesc(String performedBy);
}
