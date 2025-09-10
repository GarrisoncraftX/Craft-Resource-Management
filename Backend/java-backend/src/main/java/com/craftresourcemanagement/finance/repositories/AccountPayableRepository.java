package com.craftresourcemanagement.finance.repositories;

import com.craftresourcemanagement.finance.entities.AccountPayable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountPayableRepository extends JpaRepository<AccountPayable, Long> {
}
