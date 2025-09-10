package com.craftresourcemanagement.hr.repositories;

import com.craftresourcemanagement.hr.entities.PayrollRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PayrollRunRepository extends JpaRepository<PayrollRun, Long> {
}
