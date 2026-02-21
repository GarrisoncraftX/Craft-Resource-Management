package com.craftresourcemanagement.asset.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "consumable_transactions")
public class ConsumableTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "consumable_id", nullable = false)
    private Long consumableId;

    @Column(name = "txn_type", nullable = false, length = 10)
    private String txnType;

    @Column(nullable = false)
    private Integer qty;

    @Column(length = 120)
    private String reference;

    @Column(name = "issued_to_user_id")
    private Integer issuedToUserId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getConsumableId() { return consumableId; }
    public void setConsumableId(Long consumableId) { this.consumableId = consumableId; }
    public String getTxnType() { return txnType; }
    public void setTxnType(String txnType) { this.txnType = txnType; }
    public Integer getQty() { return qty; }
    public void setQty(Integer qty) { this.qty = qty; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public Integer getIssuedToUserId() { return issuedToUserId; }
    public void setIssuedToUserId(Integer issuedToUserId) { this.issuedToUserId = issuedToUserId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
