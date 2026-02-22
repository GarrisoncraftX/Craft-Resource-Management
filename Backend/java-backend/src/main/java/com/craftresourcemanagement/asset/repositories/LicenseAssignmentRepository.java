package com.craftresourcemanagement.asset.repositories;

import com.craftresourcemanagement.asset.entities.LicenseAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LicenseAssignmentRepository extends JpaRepository<LicenseAssignment, Long> {
    int countByLicenseId(Long licenseId);
}
