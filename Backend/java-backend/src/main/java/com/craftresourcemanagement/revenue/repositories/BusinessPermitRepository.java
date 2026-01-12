package com.craftresourcemanagement.revenue.repositories;

import com.craftresourcemanagement.revenue.entities.BusinessPermit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BusinessPermitRepository extends JpaRepository<BusinessPermit, Long> {
}
