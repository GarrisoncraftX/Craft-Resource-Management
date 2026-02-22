package com.craftresourcemanagement.asset.repositories;

import com.craftresourcemanagement.asset.entities.License;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LicenseRepository extends JpaRepository<License, Long> {
    List<License> findByDeletedAtIsNull();
}
