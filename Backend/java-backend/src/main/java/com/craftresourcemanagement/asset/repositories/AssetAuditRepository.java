package com.craftresourcemanagement.asset.repositories;

import com.craftresourcemanagement.asset.entities.AssetAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetAuditRepository extends JpaRepository<AssetAudit, Long> {
    List<AssetAudit> findByAssetIdOrderByAuditDateDesc(Long assetId);
}
