package com.craftresourcemanagement.asset.repositories;

import com.craftresourcemanagement.asset.entities.AssetModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetModelRepository extends JpaRepository<AssetModel, Long> {
}
