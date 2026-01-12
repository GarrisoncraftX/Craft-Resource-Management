package com.craftresourcemanagement.system.repositories;

import com.craftresourcemanagement.system.entities.AccessRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccessRuleRepository extends JpaRepository<AccessRule, Long> {
}
