package com.craftresourcemanagement.hr.repositories;

import com.craftresourcemanagement.hr.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmployeeId(String employeeId);
    List<User> findByAccountStatus(String accountStatus);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = CASE WHEN ?1 = true THEN 1 ELSE 0 END")
    long countByIsActive(boolean isActive);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.departmentId = ?1")
    long countByDepartmentId(long departmentId);
    
    // Automated workflow queries
    @Query("SELECT u FROM User u WHERE MONTH(u.dateOfBirth) = MONTH(?1) AND DAY(u.dateOfBirth) = DAY(?1)")
    List<User> findByBirthdayToday(LocalDate today);
    
    @Query("SELECT u FROM User u WHERE MONTH(u.hireDate) = MONTH(?1) AND DAY(u.hireDate) = DAY(?1)")
    List<User> findByAnniversaryToday(LocalDate today);
    
    List<User> findByProbationEndDate(LocalDate date);
    
    List<User> findByContractEndDate(LocalDate date);
}
