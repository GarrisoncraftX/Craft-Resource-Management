package com.craftresourcemanagement.finance.services;

import com.craftresourcemanagement.finance.entities.*;
import com.craftresourcemanagement.finance.dto.BudgetResponse;

import java.util.List;

public interface FinanceService {

    // Chart of Account
    ChartOfAccount createChartOfAccount(ChartOfAccount coa);
    List<ChartOfAccount> getAllChartOfAccounts();
    ChartOfAccount getChartOfAccountById(Long id);
    ChartOfAccount updateChartOfAccount(Long id, ChartOfAccount coa);
    void deleteChartOfAccount(Long id);

    // Budget
    Budget createBudget(Budget budget);
    List<BudgetResponse> getAllBudgets();
    Budget getBudgetById(Long id);
    Budget updateBudget(Long id, Budget budget);
    void deleteBudget(Long id);

    // Budget Request
    BudgetRequest createBudgetRequest(BudgetRequest budgetRequest);
    List<BudgetRequest> getAllBudgetRequests();
    BudgetRequest getBudgetRequestById(Long id);
    BudgetRequest updateBudgetRequest(Long id, BudgetRequest budgetRequest);
    void deleteBudgetRequest(Long id);

    // Journal Entry
    JournalEntry createJournalEntry(JournalEntry journalEntry);
    List<JournalEntry> getAllJournalEntries();
    JournalEntry getJournalEntryById(Long id);
    JournalEntry updateJournalEntry(Long id, JournalEntry journalEntry);
    void deleteJournalEntry(Long id);

    // Account Payable
    AccountPayable createAccountPayable(AccountPayable ap);
    List<AccountPayable> getAllAccountPayables();
    AccountPayable getAccountPayableById(Long id);
    AccountPayable updateAccountPayable(Long id, AccountPayable ap);
    void deleteAccountPayable(Long id);

    // Account Receivable
    AccountReceivable createAccountReceivable(AccountReceivable ar);
    List<AccountReceivable> getAllAccountReceivables();
    AccountReceivable getAccountReceivableById(Long id);
    AccountReceivable updateAccountReceivable(Long id, AccountReceivable ar);
    void deleteAccountReceivable(Long id);

    // Invoice Number Generation
    String generateAccountPayableInvoiceNumber();
    String generateAccountReceivableInvoiceNumber();
}
