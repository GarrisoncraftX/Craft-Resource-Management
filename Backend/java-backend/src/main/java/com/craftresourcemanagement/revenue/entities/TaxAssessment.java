package com.craftresourcemanagement.revenue.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tax_assessments")
public class TaxAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String taxpayerId;

    @Column(nullable = false)
    private LocalDate assessmentDate;

    @Column(nullable = false)
    private BigDecimal assessedAmount;

    private String status; // e.g., Pending, Paid, Overdue

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public String getTaxpayerId() {
        return taxpayerId;
    }

    public void setTaxpayerId(String taxpayerId) {
        this.taxpayerId = taxpayerId;
    }

    public LocalDate getAssessmentDate() {
        return assessmentDate;
    }

    public void setAssessmentDate(LocalDate assessmentDate) {
        this.assessmentDate = assessmentDate;
    }

    public BigDecimal getAssessedAmount() {
        return assessedAmount;
    }

    public void setAssessedAmount(BigDecimal assessedAmount) {
        this.assessedAmount = assessedAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
