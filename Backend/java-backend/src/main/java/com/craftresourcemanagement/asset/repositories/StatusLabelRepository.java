package com.craftresourcemanagement.asset.repositories;

import com.craftresourcemanagement.asset.entities.StatusLabel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StatusLabelRepository extends JpaRepository<StatusLabel, Long> {
}
