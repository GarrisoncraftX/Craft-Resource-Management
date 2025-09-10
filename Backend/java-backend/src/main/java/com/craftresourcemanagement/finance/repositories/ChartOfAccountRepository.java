package com.craftresourcemanagement.finance.repositories;

import com.craftresourcemanagement.finance.entities.ChartOfAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChartOfAccountRepository extends JpaRepository<ChartOfAccount, Long> {
}
