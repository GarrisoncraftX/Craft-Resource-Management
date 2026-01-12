package com.craftresourcemanagement.system.repositories;

import com.craftresourcemanagement.system.entities.GuardPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GuardPostRepository extends JpaRepository<GuardPost, Long> {
}
