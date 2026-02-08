package com.craftresourcemanagement.hr.repositories;

import com.craftresourcemanagement.hr.entities.OnboardingChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OnboardingChecklistRepository extends JpaRepository<OnboardingChecklist, Long> {
    List<OnboardingChecklist> findByUserId(Long userId);
    List<OnboardingChecklist> findByUserIdAndIsCompleted(Long userId, Boolean isCompleted);
}
