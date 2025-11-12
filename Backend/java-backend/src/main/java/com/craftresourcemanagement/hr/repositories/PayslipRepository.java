package com.craftresourcemanagement.hr.repositories;

import com.craftresourcemanagement.hr.entities.Payslip;
import com.craftresourcemanagement.hr.entities.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface PayslipRepository extends JpaRepository<Payslip, Long> {
    List<Payslip> findByUserOrderByPayPeriodEndDesc(User user);
}
