package com.craftresourcemanagement.asset.repositories;

import com.craftresourcemanagement.asset.entities.AssetMaintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetMaintenanceRepository extends JpaRepository<AssetMaintenance, Long> {
}
