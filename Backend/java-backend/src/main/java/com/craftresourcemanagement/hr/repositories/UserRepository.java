package com.craftresourcemanagement.hr.repositories;

import com.craftresourcemanagement.hr.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

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
}
