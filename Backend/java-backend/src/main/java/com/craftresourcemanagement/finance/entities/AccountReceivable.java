package com.craftresourcemanagement.finance.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "account_receivables")
public class AccountReceivable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;

    @Column(nullable = false)
    private String customerName;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate issueDate;

    @Column(nullable = false)
    private LocalDate dueDate;

    private String description;

    @Column(nullable = false)
    private String status = "Draft"; // Draft, Sent, Paid, Partial, Overdue

    private String paymentTerms;

    @Column(nullable = false)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal balance;

    // Link to Chart of Accounts - Accounts Receivable account (Asset)
    @Column(name = "ar_account_code")
    private String arAccountCode; // e.g., "1200" for Accounts Receivable

    // Link to Chart of Accounts - Revenue account
    @Column(name = "revenue_account_code")
    private String revenueAccountCode; // e.g., "4000" for Sales Revenue

    // Link to Journal Entry when posted
    @Column(name = "journal_entry_id")
    private Long journalEntryId;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at")
    private LocalDate createdAt;

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentTerms() {
        return paymentTerms;
    }

    public void setPaymentTerms(String paymentTerms) {
        this.paymentTerms = paymentTerms;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public String getArAccountCode() {
        return arAccountCode;
    }

    public void setArAccountCode(String arAccountCode) {
        this.arAccountCode = arAccountCode;
    }

    public String getRevenueAccountCode() {
        return revenueAccountCode;
    }

    public void setRevenueAccountCode(String revenueAccountCode) {
        this.revenueAccountCode = revenueAccountCode;
    }

    public Long getJournalEntryId() {
        return journalEntryId;
    }

    public void setJournalEntryId(Long journalEntryId) {
        this.journalEntryId = journalEntryId;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }
}
