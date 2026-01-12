package com.craftresourcemanagement.system.repositories;

import com.craftresourcemanagement.system.entities.SecurityIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SecurityIncidentRepository extends JpaRepository<SecurityIncident, Long> {
}
