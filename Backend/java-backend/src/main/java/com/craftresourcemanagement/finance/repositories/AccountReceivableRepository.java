package com.craftresourcemanagement.finance.repositories;

import com.craftresourcemanagement.finance.entities.AccountReceivable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountReceivableRepository extends JpaRepository<AccountReceivable, Long> {
}
