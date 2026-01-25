package com.craftresourcemanagement.finance.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "invoice_sequences")
public class InvoiceSequence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sequenceType; // "AP" for Account Payable, "AR" for Account Receivable

    @Column(nullable = false)
    private Long lastNumber = 0L;

    @Column(nullable = false)
    private String prefix; // "AP-", "AR-"

    // Constructors
    public InvoiceSequence() {}

    public InvoiceSequence(String sequenceType, String prefix) {
        this.sequenceType = sequenceType;
        this.prefix = prefix;
        this.lastNumber = 0L;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSequenceType() {
        return sequenceType;
    }

    public void setSequenceType(String sequenceType) {
        this.sequenceType = sequenceType;
    }

    public Long getLastNumber() {
        return lastNumber;
    }

    public void setLastNumber(Long lastNumber) {
        this.lastNumber = lastNumber;
    }

    public String getPrefix() {
        return prefix;
    }

    public void setPrefix(String prefix) {
        this.prefix = prefix;
    }
}
