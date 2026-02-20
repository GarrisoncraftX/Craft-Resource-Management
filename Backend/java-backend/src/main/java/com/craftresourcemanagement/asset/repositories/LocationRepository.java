package com.craftresourcemanagement.asset.repositories;

import com.craftresourcemanagement.asset.entities.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
}
