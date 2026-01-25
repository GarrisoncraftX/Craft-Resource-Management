package com.craftresourcemanagement.finance.repositories;

import com.craftresourcemanagement.finance.entities.InvoiceSequence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Optional;

@Repository
public interface InvoiceSequenceRepository extends JpaRepository<InvoiceSequence, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM InvoiceSequence s WHERE s.sequenceType = :sequenceType")
    Optional<InvoiceSequence> findBySequenceTypeWithLock(@Param("sequenceType") String sequenceType);

    Optional<InvoiceSequence> findBySequenceType(String sequenceType);

    @Modifying
    @Query("UPDATE InvoiceSequence s SET s.lastNumber = s.lastNumber + 1 WHERE s.sequenceType = :sequenceType")
    int incrementSequence(@Param("sequenceType") String sequenceType);
}
