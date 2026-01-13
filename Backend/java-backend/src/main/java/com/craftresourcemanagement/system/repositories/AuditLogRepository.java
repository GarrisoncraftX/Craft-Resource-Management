package com.craftresourcemanagement.system.repositories;

import com.craftresourcemanagement.system.entities.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    // Existing method
    List<AuditLog> findTop5ByPerformedByOrderByTimestampDesc(String performedBy);
    
    // Enhanced query methods with pagination
    Page<AuditLog> findByPerformedByOrderByTimestampDesc(String performedBy, Pageable pageable);
    
    Page<AuditLog> findByPerformedByAndTimestampBetweenOrderByTimestampDesc(
        String performedBy, 
        LocalDateTime startDate, 
        LocalDateTime endDate, 
        Pageable pageable
    );
    
    Page<AuditLog> findByActionOrderByTimestampDesc(String action, Pageable pageable);
    
    Page<AuditLog> findByServiceNameOrderByTimestampDesc(String serviceName, Pageable pageable);
    
    Page<AuditLog> findByEntityTypeAndEntityIdOrderByTimestampDesc(
        String entityType, 
        String entityId, 
        Pageable pageable
    );
    
    Page<AuditLog> findByTimestampBetweenOrderByTimestampDesc(
        LocalDateTime startDate, 
        LocalDateTime endDate, 
        Pageable pageable
    );
    
    // Advanced search
    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:performedBy IS NULL OR a.performedBy = :performedBy) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:serviceName IS NULL OR a.serviceName = :serviceName) AND " +
           "(:entityType IS NULL OR a.entityType = :entityType) AND " +
           "(:startDate IS NULL OR a.timestamp >= :startDate) AND " +
           "(:endDate IS NULL OR a.timestamp <= :endDate) " +
           "ORDER BY a.timestamp DESC")
    Page<AuditLog> searchAuditLogs(
        @Param("performedBy") String performedBy,
        @Param("action") String action,
        @Param("serviceName") String serviceName,
        @Param("entityType") String entityType,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );
    
    // Analytics queries
    @Query("SELECT a.action, COUNT(a) FROM AuditLog a WHERE a.timestamp >= :since GROUP BY a.action ORDER BY COUNT(a) DESC")
    List<Object[]> getTopActionsSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT a.performedBy, COUNT(a) FROM AuditLog a WHERE a.timestamp >= :since GROUP BY a.performedBy ORDER BY COUNT(a) DESC")
    List<Object[]> getTopUsersSince(@Param("since") LocalDateTime since);
    
    // Count methods for statistics
    long countByPerformedByAndTimestampBetween(String performedBy, LocalDateTime startDate, LocalDateTime endDate);
    
    long countByActionAndTimestampBetween(String action, LocalDateTime startDate, LocalDateTime endDate);
}
