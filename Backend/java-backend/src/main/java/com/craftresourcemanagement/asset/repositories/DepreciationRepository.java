package com.craftresourcemanagement.asset.repositories;

import com.craftresourcemanagement.asset.entities.Depreciation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepreciationRepository extends JpaRepository<Depreciation, Long> {
}
