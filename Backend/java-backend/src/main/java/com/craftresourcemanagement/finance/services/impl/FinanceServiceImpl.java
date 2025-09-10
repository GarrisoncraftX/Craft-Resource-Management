package com.craftresourcemanagement.finance.services.impl;

import com.craftresourcemanagement.finance.entities.*;
import com.craftresourcemanagement.finance.repositories.*;
import com.craftresourcemanagement.finance.services.FinanceService;
import com.craftresourcemanagement.finance.dto.BudgetResponse;
import com.craftresourcemanagement.utils.OpenAIClient;
import com.craftresourcemanagement.utils.OpenAIClientException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;

@Service
public class FinanceServiceImpl implements FinanceService {

    private static final Logger logger = LoggerFactory.getLogger(FinanceServiceImpl.class);

    private final ChartOfAccountRepository chartOfAccountRepository;
    private final BudgetRepository budgetRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final AccountPayableRepository accountPayableRepository;
    private final AccountReceivableRepository accountReceivableRepository;
    private final BudgetRequestRepository budgetRequestRepository;
    private final DepartmentClient departmentClient;

    private final OpenAIClient openAIClient;

    @Value("${openai.api.key}")
    private String openAIKey;

    public FinanceServiceImpl(ChartOfAccountRepository chartOfAccountRepository,
                             BudgetRepository budgetRepository,
                             JournalEntryRepository journalEntryRepository,
                             AccountPayableRepository accountPayableRepository,
                             AccountReceivableRepository accountReceivableRepository,
                             BudgetRequestRepository budgetRequestRepository,
                             OpenAIClient openAIClient,
                             DepartmentClient departmentClient) {
        this.chartOfAccountRepository = chartOfAccountRepository;
        this.budgetRepository = budgetRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.accountPayableRepository = accountPayableRepository;
        this.accountReceivableRepository = accountReceivableRepository;
        this.budgetRequestRepository = budgetRequestRepository;
        this.openAIClient = openAIClient;
        this.departmentClient = departmentClient;
    }

    // Chart of Account
    @Override
    public ChartOfAccount createChartOfAccount(ChartOfAccount coa) {
        return chartOfAccountRepository.save(coa);
    }

    @Override
    public List<ChartOfAccount> getAllChartOfAccounts() {
        List<ChartOfAccount> accounts = chartOfAccountRepository.findAll();

        // Calculate balance for each account by aggregating journal entries
        for (ChartOfAccount account : accounts) {
            Double balance = journalEntryRepository.calculateBalanceByAccountCode(account.getAccountCode());
            account.setBalance(balance != null ? balance : 0.0);
        }

        return accounts;
    }

    @Override
    public ChartOfAccount getChartOfAccountById(Long id) {
        return chartOfAccountRepository.findById(id).orElse(null);
    }

    @Override
    public ChartOfAccount updateChartOfAccount(Long id, ChartOfAccount coa) {
        Optional<ChartOfAccount> existing = chartOfAccountRepository.findById(id);
        if (existing.isPresent()) {
            ChartOfAccount toUpdate = existing.get();
            toUpdate.setAccountCode(coa.getAccountCode());
            toUpdate.setAccountName(coa.getAccountName());
            toUpdate.setAccountType(coa.getAccountType());
            toUpdate.setDescription(coa.getDescription());
            return chartOfAccountRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deleteChartOfAccount(Long id) {
        chartOfAccountRepository.deleteById(id);
    }

    // Budget
    @Override
    public Budget createBudget(Budget budget) {
        return budgetRepository.save(budget);
    }

    private BigDecimal calculateRemainingAmount(Budget budget) {
        if (budget.getRemainingAmount() != null) {
            return budget.getRemainingAmount();
        }
        
        BigDecimal totalAmount;
        if (budget.getTotalAmount() != null) {
            totalAmount = budget.getTotalAmount();
        } else if (budget.getAmount() != null) {
            totalAmount = budget.getAmount();
        } else {
            totalAmount = BigDecimal.ZERO;
        }
                
        BigDecimal spentAmount = budget.getSpentAmount() != null 
            ? budget.getSpentAmount() 
            : BigDecimal.ZERO;
            
        return totalAmount.subtract(spentAmount);
    }
    
    private BigDecimal getBudgetAmount(Budget budget) {
        if (budget.getTotalAmount() != null) {
            return budget.getTotalAmount();
        }
        return budget.getAmount() != null ? budget.getAmount() : BigDecimal.ZERO;
    }

    @Override
    public List<BudgetResponse> getAllBudgets() {
        List<Budget> budgets = budgetRepository.findAll();
        return budgets.stream()
            .map(budget -> {
                String departmentName = null;
                if (budget.getDepartmentId() != null) {
                    departmentName = departmentClient.getDepartmentNameById(budget.getDepartmentId());
                }
                
                BigDecimal remainingAmount = calculateRemainingAmount(budget);
                
                return new BudgetResponse.Builder()
                    .id(budget.getId())
                    .budgetName(budget.getBudgetName())
                    .amount(getBudgetAmount(budget))
                    .startDate(budget.getStartDate())
                    .endDate(budget.getEndDate())
                    .description(budget.getDescription())
                    .departmentId(budget.getDepartmentId())
                    .departmentName(departmentName)
                    .spentAmount(budget.getSpentAmount())
                    .remainingAmount(remainingAmount)
                    .build();
            })
            .toList();
    }

    @Override
    public Budget getBudgetById(Long id) {
        return budgetRepository.findById(id).orElse(null);
    }

    @Override
    public Budget updateBudget(Long id, Budget budget) {
        Optional<Budget> existing = budgetRepository.findById(id);
        if (existing.isPresent()) {
            Budget toUpdate = existing.get();
            toUpdate.setBudgetName(budget.getBudgetName());
            toUpdate.setDescription(budget.getDescription());
            toUpdate.setDepartmentId(budget.getDepartmentId());
            toUpdate.setFiscalYear(budget.getFiscalYear());
            toUpdate.setStartDate(budget.getStartDate());
            toUpdate.setEndDate(budget.getEndDate());
            toUpdate.setTotalAmount(budget.getTotalAmount());
            toUpdate.setAllocatedAmount(budget.getAllocatedAmount());
            toUpdate.setSpentAmount(budget.getSpentAmount());
            toUpdate.setRemainingAmount(budget.getRemainingAmount());
            toUpdate.setStatus(budget.getStatus());
            toUpdate.setAmount(budget.getAmount());
            toUpdate.setCreatedBy(budget.getCreatedBy());
            toUpdate.setApprovedBy(budget.getApprovedBy());
            toUpdate.setApprovedAt(budget.getApprovedAt());
            toUpdate.setCreatedAt(budget.getCreatedAt());
            toUpdate.setUpdatedAt(budget.getUpdatedAt());
            return budgetRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deleteBudget(Long id) {
        budgetRepository.deleteById(id);
    }

    // Journal Entry
    @Override
    public JournalEntry createJournalEntry(JournalEntry journalEntry) {
        JournalEntry savedEntry = journalEntryRepository.save(journalEntry);
        // After saving, call anomaly detection AI
        detectAnomaly(savedEntry);
        return savedEntry;
    }

    @Override
    public List<JournalEntry> getAllJournalEntries() {
        return journalEntryRepository.findAll();
    }

    @Override
    public JournalEntry getJournalEntryById(Long id) {
        return journalEntryRepository.findById(id).orElse(null);
    }

    @Override
    public JournalEntry updateJournalEntry(Long id, JournalEntry journalEntry) {
        Optional<JournalEntry> existing = journalEntryRepository.findById(id);
        if (existing.isPresent()) {
            JournalEntry toUpdate = existing.get();
            toUpdate.setEntryDate(journalEntry.getEntryDate());
            toUpdate.setDescription(journalEntry.getDescription());
            toUpdate.setAmount(journalEntry.getAmount());
            toUpdate.setAccountCode(journalEntry.getAccountCode());
            JournalEntry updatedEntry = journalEntryRepository.save(toUpdate);
            // After update, call anomaly detection AI
            detectAnomaly(updatedEntry);
            return updatedEntry;
        }
        return null;
    }

    @Override
    public void deleteJournalEntry(Long id) {
        journalEntryRepository.deleteById(id);
    }

    // Account Payable
    @Override
    public AccountPayable createAccountPayable(AccountPayable ap) {
        return accountPayableRepository.save(ap);
    }

    @Override
    public List<AccountPayable> getAllAccountPayables() {
        return accountPayableRepository.findAll();
    }

    @Override
    public AccountPayable getAccountPayableById(Long id) {
        return accountPayableRepository.findById(id).orElse(null);
    }

    @Override
    public AccountPayable updateAccountPayable(Long id, AccountPayable ap) {
        Optional<AccountPayable> existing = accountPayableRepository.findById(id);
        if (existing.isPresent()) {
            AccountPayable toUpdate = existing.get();
            toUpdate.setVendorName(ap.getVendorName());
            toUpdate.setAmount(ap.getAmount());
            toUpdate.setDueDate(ap.getDueDate());
            toUpdate.setDescription(ap.getDescription());
            return accountPayableRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deleteAccountPayable(Long id) {
        accountPayableRepository.deleteById(id);
    }

    // Account Receivable
    @Override
    public AccountReceivable createAccountReceivable(AccountReceivable ar) {
        return accountReceivableRepository.save(ar);
    }

    @Override
    public List<AccountReceivable> getAllAccountReceivables() {
        return accountReceivableRepository.findAll();
    }

    @Override
    public AccountReceivable getAccountReceivableById(Long id) {
        return accountReceivableRepository.findById(id).orElse(null);
    }

    @Override
    public AccountReceivable updateAccountReceivable(Long id, AccountReceivable ar) {
        Optional<AccountReceivable> existing = accountReceivableRepository.findById(id);
        if (existing.isPresent()) {
            AccountReceivable toUpdate = existing.get();
            toUpdate.setCustomerName(ar.getCustomerName());
            toUpdate.setAmount(ar.getAmount());
            toUpdate.setDueDate(ar.getDueDate());
            toUpdate.setDescription(ar.getDescription());
            return accountReceivableRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deleteAccountReceivable(Long id) {
        accountReceivableRepository.deleteById(id);
    }

    // Budget Request
    @Override
    public BudgetRequest createBudgetRequest(BudgetRequest budgetRequest) {
        return budgetRequestRepository.save(budgetRequest);
    }

    @Override
    public List<BudgetRequest> getAllBudgetRequests() {
        return budgetRequestRepository.findAll();
    }

    @Override
    public BudgetRequest getBudgetRequestById(Long id) {
        return budgetRequestRepository.findById(id).orElse(null);
    }

    @Override
    public BudgetRequest updateBudgetRequest(Long id, BudgetRequest budgetRequest) {
        Optional<BudgetRequest> existing = budgetRequestRepository.findById(id);
        if (existing.isPresent()) {
            BudgetRequest toUpdate = existing.get();
            toUpdate.setDepartment(budgetRequest.getDepartment());
            toUpdate.setCategory(budgetRequest.getCategory());
            toUpdate.setRequestedAmount(budgetRequest.getRequestedAmount());
            toUpdate.setJustification(budgetRequest.getJustification());
            toUpdate.setRequestedBy(budgetRequest.getRequestedBy());
            toUpdate.setRequestDate(budgetRequest.getRequestDate());
            toUpdate.setStatus(budgetRequest.getStatus());
            return budgetRequestRepository.save(toUpdate);
        }
        return null;
    }

    @Override
    public void deleteBudgetRequest(Long id) {
        budgetRequestRepository.deleteById(id);
    }

    private void detectAnomaly(JournalEntry journalEntry) {
        // Prepare prompt for anomaly detection
        String prompt = "Analyze the provided financial transaction data for anomalies. If an anomaly is detected, clearly state 'Anomaly Detected', provide a brief, humane explanation of why it's considered anomalous, and suggest a next step. If no anomaly is found, state 'No Anomaly Detected'. Prioritize accuracy and conciseness in your response: " + journalEntry.toString();
        try {
            String response = openAIClient.callOpenAIAPI(openAIKey, prompt);
            logger.info("Anomaly detection result: {}", response);

          }  catch (InterruptedException e) {
            Thread.currentThread().interrupt();

             throw new OpenAIClientException("OpenAI API call interrupted unexpectedly.", e);
            } catch (Exception e) {
                
            logger.error("Error during anomaly detection: {}", e.getMessage());
        }
    }
}

