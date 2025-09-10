package com.craftresourcemanagement.finance.repositories;

import com.craftresourcemanagement.finance.entities.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
}
