package com.craftresourcemanagement.system.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "access_rules")
@Data
public class AccessRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String door;

    @Column(nullable = false)
    private String schedule;

    @Column(nullable = false)
    private String status;
}
