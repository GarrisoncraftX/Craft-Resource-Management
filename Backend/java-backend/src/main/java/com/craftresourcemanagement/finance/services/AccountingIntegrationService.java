package com.craftresourcemanagement.finance.services;

import com.craftresourcemanagement.finance.entities.AccountPayable;
import com.craftresourcemanagement.finance.entities.AccountReceivable;
import com.craftresourcemanagement.finance.entities.JournalEntry;
import com.craftresourcemanagement.finance.repositories.JournalEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Service to integrate Accounts Payable/Receivable with Journal Entries
 * Implements double-entry bookkeeping principles
 */
@Service
public class AccountingIntegrationService {

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    /**
     * Creates journal entry when an Account Payable is approved
     * Debit: Expense Account
     * Credit: Accounts Payable (Liability)
     */
    @Transactional
    public JournalEntry createJournalEntryForPayable(AccountPayable payable) {
        JournalEntry entry = new JournalEntry();
        entry.setEntryDate(LocalDateTime.now());
        entry.setDescription("AP Invoice: " + payable.getInvoiceNumber() + " - " + payable.getDescription());
        entry.setAmount(payable.getAmount());
        entry.setAccountCode(payable.getExpenseAccountCode());
        entry.setReference("AP-" + payable.getInvoiceNumber());
        entry.setStatus("Posted");
        entry.setTotalDebit(payable.getAmount());
        entry.setTotalCredit(payable.getAmount());
        entry.setCreatedBy(payable.getCreatedBy());
        
        return journalEntryRepository.save(entry);
    }

    /**
     * Creates journal entry when an Account Receivable is sent
     * Debit: Accounts Receivable (Asset)
     * Credit: Revenue Account
     */
    @Transactional
    public JournalEntry createJournalEntryForReceivable(AccountReceivable receivable) {
        JournalEntry entry = new JournalEntry();
        entry.setEntryDate(LocalDateTime.now());
        entry.setDescription("AR Invoice: " + receivable.getInvoiceNumber() + " - " + receivable.getDescription());
        entry.setAmount(receivable.getAmount());
        entry.setAccountCode(receivable.getArAccountCode());
        entry.setReference("AR-" + receivable.getInvoiceNumber());
        entry.setStatus("Posted");
        entry.setTotalDebit(receivable.getAmount());
        entry.setTotalCredit(receivable.getAmount());
        entry.setCreatedBy(receivable.getCreatedBy());
        
        return journalEntryRepository.save(entry);
    }

    /**
     * Creates journal entry when payment is received for AR
     * Debit: Cash/Bank Account
     * Credit: Accounts Receivable
     */
    @Transactional
    public JournalEntry createPaymentReceivedEntry(AccountReceivable receivable, BigDecimal paymentAmount) {
        JournalEntry entry = new JournalEntry();
        entry.setEntryDate(LocalDateTime.now());
        entry.setDescription("Payment received for Invoice: " + receivable.getInvoiceNumber());
        entry.setAmount(paymentAmount);
        entry.setAccountCode(receivable.getArAccountCode());
        entry.setReference("PMT-" + receivable.getInvoiceNumber());
        entry.setStatus("Posted");
        entry.setTotalDebit(paymentAmount);
        entry.setTotalCredit(paymentAmount);
        
        return journalEntryRepository.save(entry);
    }

    /**
     * Creates journal entry when payment is made for AP
     * Debit: Accounts Payable
     * Credit: Cash/Bank Account
     */
    @Transactional
    public JournalEntry createPaymentMadeEntry(AccountPayable payable) {
        JournalEntry entry = new JournalEntry();
        entry.setEntryDate(LocalDateTime.now());
        entry.setDescription("Payment made for Invoice: " + payable.getInvoiceNumber());
        entry.setAmount(payable.getAmount());
        entry.setAccountCode(payable.getApAccountCode());
        entry.setReference("PMT-" + payable.getInvoiceNumber());
        entry.setStatus("Posted");
        entry.setTotalDebit(payable.getAmount());
        entry.setTotalCredit(payable.getAmount());
        
        return journalEntryRepository.save(entry);
    }
}
