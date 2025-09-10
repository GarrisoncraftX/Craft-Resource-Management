package com.craftresourcemanagement.finance.repositories;

import com.craftresourcemanagement.finance.entities.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {

    @Query("SELECT SUM(j.amount) FROM JournalEntry j WHERE j.accountCode = :accountCode")
    Double calculateBalanceByAccountCode(@Param("accountCode") String accountCode);
}
