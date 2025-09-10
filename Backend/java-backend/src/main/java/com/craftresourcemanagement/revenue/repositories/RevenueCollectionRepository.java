package com.craftresourcemanagement.revenue.repositories;

import com.craftresourcemanagement.revenue.entities.RevenueCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RevenueCollectionRepository extends JpaRepository<RevenueCollection, Long> {
}
