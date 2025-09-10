package com.craftresourcemanagement.legal.entities;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "compliance_records")
public class ComplianceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String complianceType;

    @Column(nullable = false)
    private LocalDate complianceDate;

    private String description;

    private String responsiblePerson;

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public String getComplianceType() {
        return complianceType;
    }

    public void setComplianceType(String complianceType) {
        this.complianceType = complianceType;
    }

    public LocalDate getComplianceDate() {
        return complianceDate;
    }

    public void setComplianceDate(LocalDate complianceDate) {
        this.complianceDate = complianceDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getResponsiblePerson() {
        return responsiblePerson;
    }

    public void setResponsiblePerson(String responsiblePerson) {
        this.responsiblePerson = responsiblePerson;
    }
}
