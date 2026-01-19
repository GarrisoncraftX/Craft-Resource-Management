package com.craftresourcemanagement.finance.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "account_payables")
public class AccountPayable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;

    @Column(nullable = false)
    private String vendorName;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate issueDate;

    @Column(nullable = false)
    private LocalDate dueDate;

    private String description;

    @Column(nullable = false)
    private String status = "Pending";

    private String category;

    private String paymentTerms;

    // Link to Chart of Accounts - Accounts Payable account (Liability)
    @Column(name = "ap_account_code")
    private String apAccountCode; // e.g., "2000" for Accounts Payable

    // Link to Chart of Accounts - Expense account
    @Column(name = "expense_account_code")
    private String expenseAccountCode; // e.g., "5000" for Office Expenses

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

    public String getVendorName() {
        return vendorName;
    }

    public void setVendorName(String vendorName) {
        this.vendorName = vendorName;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPaymentTerms() {
        return paymentTerms;
    }

    public void setPaymentTerms(String paymentTerms) {
        this.paymentTerms = paymentTerms;
    }

    public String getApAccountCode() {
        return apAccountCode;
    }

    public void setApAccountCode(String apAccountCode) {
        this.apAccountCode = apAccountCode;
    }

    public String getExpenseAccountCode() {
        return expenseAccountCode;
    }

    public void setExpenseAccountCode(String expenseAccountCode) {
        this.expenseAccountCode = expenseAccountCode;
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
