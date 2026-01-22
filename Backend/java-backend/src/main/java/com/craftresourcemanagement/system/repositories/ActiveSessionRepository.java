package com.craftresourcemanagement.system.repositories;

import com.craftresourcemanagement.system.entities.ActiveSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

@Repository
public interface ActiveSessionRepository extends JpaRepository<ActiveSession, String> {
    @Modifying
    @Query("DELETE FROM ActiveSession s WHERE s.lastActivity < ?1")
    void deleteInactiveSessions(LocalDateTime threshold);
}
