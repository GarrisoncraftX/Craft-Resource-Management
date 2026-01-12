package com.craftresourcemanagement.system.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "guard_posts")
@Data
public class GuardPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String post;

    @Column(nullable = false)
    private Integer guards;

    @Column(nullable = false)
    private String shift;

    @Column(nullable = false)
    private String status;
}
