package com.craftresourcemanagement.hr.repositories;

import com.craftresourcemanagement.hr.entities.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PayslipRepository extends JpaRepository<Payslip, Long> {
}
