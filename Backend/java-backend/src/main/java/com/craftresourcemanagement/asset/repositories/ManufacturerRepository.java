package com.craftresourcemanagement.asset.repositories;

import com.craftresourcemanagement.asset.entities.Manufacturer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ManufacturerRepository extends JpaRepository<Manufacturer, Long> {
}
