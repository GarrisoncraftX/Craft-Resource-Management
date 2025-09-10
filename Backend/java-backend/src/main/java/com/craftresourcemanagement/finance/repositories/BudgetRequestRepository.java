package com.craftresourcemanagement.finance.repositories;

import com.craftresourcemanagement.finance.entities.BudgetRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BudgetRequestRepository extends JpaRepository<BudgetRequest, Long> {
}
