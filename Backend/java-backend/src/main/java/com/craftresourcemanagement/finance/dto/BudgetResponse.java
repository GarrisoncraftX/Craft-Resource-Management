package com.craftresourcemanagement.finance.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class BudgetResponse {
    private Long id;
    private String budgetName;
    private BigDecimal amount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
    private Long departmentId;
    private String departmentName;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;

    private BudgetResponse(Builder builder) {
        this.id = builder.id;
        this.budgetName = builder.budgetName;
        this.amount = builder.amount;
        this.startDate = builder.startDate;
        this.endDate = builder.endDate;
        this.description = builder.description;
        this.departmentId = builder.departmentId;
        this.departmentName = builder.departmentName;
        this.spentAmount = builder.spentAmount;
        this.remainingAmount = builder.remainingAmount;
    }

    public Long getId() {
        return id;
    }

    public String getBudgetName() {
        return budgetName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public String getDescription() {
        return description;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public BigDecimal getSpentAmount() {
        return spentAmount;
    }

    public BigDecimal getRemainingAmount() {
        return remainingAmount;
    }

    public static class Builder {
        private Long id;
        private String budgetName;
        private BigDecimal amount;
        private LocalDate startDate;
        private LocalDate endDate;
        private String description;
        private Long departmentId;
        private String departmentName;
        private BigDecimal spentAmount;
        private BigDecimal remainingAmount;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder budgetName(String budgetName) {
            this.budgetName = budgetName;
            return this;
        }

        public Builder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public Builder startDate(LocalDate startDate) {
            this.startDate = startDate;
            return this;
        }

        public Builder endDate(LocalDate endDate) {
            this.endDate = endDate;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder departmentId(Long departmentId) {
            this.departmentId = departmentId;
            return this;
        }

        public Builder departmentName(String departmentName) {
            this.departmentName = departmentName;
            return this;
        }

        public Builder spentAmount(BigDecimal spentAmount) {
            this.spentAmount = spentAmount;
            return this;
        }

        public Builder remainingAmount(BigDecimal remainingAmount) {
            this.remainingAmount = remainingAmount;
            return this;
        }

        public BudgetResponse build() {
            return new BudgetResponse(this);
        }
    }
}
