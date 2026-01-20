package com.craftresourcemanagement.finance.services;

import com.craftresourcemanagement.finance.entities.AccountPayable;
import com.craftresourcemanagement.finance.entities.AccountReceivable;
import com.craftresourcemanagement.finance.entities.JournalEntry;
import com.craftresourcemanagement.finance.repositories.JournalEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Service to integrate Accounts Payable/Receivable with Journal Entries
 * Implements double-entry bookkeeping principles
 */
@Service
public class AccountingIntegrationService {

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    private String generateEntryNumber(String suffix) {
        LocalDate now = LocalDate.now();
        String dateStr = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = journalEntryRepository.count() + 1;
        return String.format("JE-%s-%03d-%s", dateStr, count, suffix);
    }

    /**
     * Creates journal entry when an Account Payable is approved
     * Debit: Expense Account
     * Credit: Accounts Payable (Liability)
     */
    @Transactional
    public void createJournalEntryForPayable(AccountPayable payable) {
        LocalDate now = LocalDate.now();
        Long userId = payable.getCreatedBy() != null ? payable.getCreatedBy() : 1L;
        String baseRef = "AP-" + payable.getInvoiceNumber();
        
        // Debit: Expense Account
        JournalEntry debit = new JournalEntry();
        debit.setEntryNumber(generateEntryNumber("L01"));
        debit.setEntryDate(now);
        debit.setDescription("AP Invoice: " + payable.getInvoiceNumber() + " (Expense)");
        debit.setAmount(payable.getAmount());
        debit.setAccountCode(payable.getExpenseAccountCode());
        debit.setReference(baseRef + "-DR");
        debit.setStatus("posted");
        debit.setTotalDebit(payable.getAmount());
        debit.setTotalCredit(BigDecimal.ZERO);
        debit.setCreatedBy(userId);
        journalEntryRepository.save(debit);
        
        // Credit: Accounts Payable
        JournalEntry credit = new JournalEntry();
        credit.setEntryNumber(generateEntryNumber("L02"));
        credit.setEntryDate(now);
        credit.setDescription("AP Invoice: " + payable.getInvoiceNumber() + " (AP)");
        credit.setAmount(payable.getAmount());
        credit.setAccountCode(payable.getApAccountCode());
        credit.setReference(baseRef + "-CR");
        credit.setStatus("posted");
        credit.setTotalDebit(BigDecimal.ZERO);
        credit.setTotalCredit(payable.getAmount());
        credit.setCreatedBy(userId);
        journalEntryRepository.save(credit);
    }

    /**
     * Creates journal entry when an Account Receivable is sent
     * Debit: Accounts Receivable (Asset)
     * Credit: Revenue Account
     */
    @Transactional
    public void createJournalEntryForReceivable(AccountReceivable receivable) {
        LocalDate now = LocalDate.now();
        Long userId = receivable.getCreatedBy() != null ? receivable.getCreatedBy() : 1L;
        String baseRef = "AR-" + receivable.getInvoiceNumber();
        
        // Debit: Accounts Receivable
        JournalEntry debit = new JournalEntry();
        debit.setEntryNumber(generateEntryNumber("L01"));
        debit.setEntryDate(now);
        debit.setDescription("AR Invoice: " + receivable.getInvoiceNumber() + " (AR)");
        debit.setAmount(receivable.getAmount());
        debit.setAccountCode(receivable.getArAccountCode());
        debit.setReference(baseRef + "-DR");
        debit.setStatus("posted");
        debit.setTotalDebit(receivable.getAmount());
        debit.setTotalCredit(BigDecimal.ZERO);
        debit.setCreatedBy(userId);
        journalEntryRepository.save(debit);
        
        // Credit: Revenue Account
        JournalEntry credit = new JournalEntry();
        credit.setEntryNumber(generateEntryNumber("L02"));
        credit.setEntryDate(now);
        credit.setDescription("AR Invoice: " + receivable.getInvoiceNumber() + " (Revenue)");
        credit.setAmount(receivable.getAmount());
        credit.setAccountCode(receivable.getRevenueAccountCode());
        credit.setReference(baseRef + "-CR");
        credit.setStatus("posted");
        credit.setTotalDebit(BigDecimal.ZERO);
        credit.setTotalCredit(receivable.getAmount());
        credit.setCreatedBy(userId);
        journalEntryRepository.save(credit);
    }

    /**
     * Creates journal entry when payment is received for AR
     * Debit: Cash/Bank Account
     * Credit: Accounts Receivable
     */
    @Transactional
    public void createPaymentReceivedEntry(AccountReceivable receivable, BigDecimal paymentAmount) {
        LocalDate now = LocalDate.now();
        Long userId = receivable.getCreatedBy() != null ? receivable.getCreatedBy() : 1L;
        String baseRef = "PMT-" + receivable.getInvoiceNumber();
        
        // Debit: Bank Account
        JournalEntry debit = new JournalEntry();
        debit.setEntryNumber(generateEntryNumber("L01"));
        debit.setEntryDate(now);
        debit.setDescription("Payment received for Invoice: " + receivable.getInvoiceNumber() + " (Bank)");
        debit.setAmount(paymentAmount);
        debit.setAccountCode("1120"); // Bank Account
        debit.setReference(baseRef + "-DR");
        debit.setStatus("posted");
        debit.setTotalDebit(paymentAmount);
        debit.setTotalCredit(BigDecimal.ZERO);
        debit.setCreatedBy(userId);
        journalEntryRepository.save(debit);
        
        // Credit: Accounts Receivable
        JournalEntry credit = new JournalEntry();
        credit.setEntryNumber(generateEntryNumber("L02"));
        credit.setEntryDate(now);
        credit.setDescription("Payment received for Invoice: " + receivable.getInvoiceNumber() + " (AR)");
        credit.setAmount(paymentAmount);
        credit.setAccountCode(receivable.getArAccountCode());
        credit.setReference(baseRef + "-CR");
        credit.setStatus("posted");
        credit.setTotalDebit(BigDecimal.ZERO);
        credit.setTotalCredit(paymentAmount);
        credit.setCreatedBy(userId);
        journalEntryRepository.save(credit);
    }

    /**
     * Creates journal entry when payment is made for AP
     * Debit: Accounts Payable
     * Credit: Cash/Bank Account
     */
    @Transactional
    public void createPaymentMadeEntry(AccountPayable payable) {
        LocalDate now = LocalDate.now();
        Long userId = payable.getCreatedBy() != null ? payable.getCreatedBy() : 1L;
        String baseRef = "PMT-" + payable.getInvoiceNumber();
        
        // Debit: Accounts Payable
        JournalEntry debit = new JournalEntry();
        debit.setEntryNumber(generateEntryNumber("L01"));
        debit.setEntryDate(now);
        debit.setDescription("Payment made for Invoice: " + payable.getInvoiceNumber() + " (AP)");
        debit.setAmount(payable.getAmount());
        debit.setAccountCode(payable.getApAccountCode());
        debit.setReference(baseRef + "-DR");
        debit.setStatus("posted");
        debit.setTotalDebit(payable.getAmount());
        debit.setTotalCredit(BigDecimal.ZERO);
        debit.setCreatedBy(userId);
        journalEntryRepository.save(debit);
        
        // Credit: Bank Account
        JournalEntry credit = new JournalEntry();
        credit.setEntryNumber(generateEntryNumber("L02"));
        credit.setEntryDate(now);
        credit.setDescription("Payment made for Invoice: " + payable.getInvoiceNumber() + " (Bank)");
        credit.setAmount(payable.getAmount());
        credit.setAccountCode("1120"); // Bank Account
        credit.setReference(baseRef + "-CR");
        credit.setStatus("posted");
        credit.setTotalDebit(BigDecimal.ZERO);
        credit.setTotalCredit(payable.getAmount());
        credit.setCreatedBy(userId);
        journalEntryRepository.save(credit);
    }
}
