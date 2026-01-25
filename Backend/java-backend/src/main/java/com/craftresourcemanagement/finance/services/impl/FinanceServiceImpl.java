package com.craftresourcemanagement.finance.services.impl;

import com.craftresourcemanagement.finance.entities.*;
import com.craftresourcemanagement.finance.repositories.*;
import com.craftresourcemanagement.finance.services.FinanceService;
import com.craftresourcemanagement.finance.services.InvoiceNumberService;
import com.craftresourcemanagement.finance.dto.BudgetResponse;
import com.craftresourcemanagement.utils.OpenAIClient;
import com.craftresourcemanagement.utils.AuditClient;
import com.craftresourcemanagement.utils.OpenAIClientException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;

@Service
@Transactional
public class FinanceServiceImpl implements FinanceService {

    private static final Logger logger = LoggerFactory.getLogger(FinanceServiceImpl.class);
    private static final Long SYSTEM_USER_ID = null;

    private final ChartOfAccountRepository chartOfAccountRepository;
    private final BudgetRepository budgetRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final AccountPayableRepository accountPayableRepository;
    private final AccountReceivableRepository accountReceivableRepository;
    private final BudgetRequestRepository budgetRequestRepository;
    private final DepartmentClient departmentClient;
    private final InvoiceNumberService invoiceNumberService;

    private final OpenAIClient openAIClient;
    private final AuditClient auditClient;

    @Value("${openai.api.key}")
    private String openAIKey;

    public FinanceServiceImpl(ChartOfAccountRepository chartOfAccountRepository,
                             BudgetRepository budgetRepository,
                             JournalEntryRepository journalEntryRepository,
                             AccountPayableRepository accountPayableRepository,
                             AccountReceivableRepository accountReceivableRepository,
                             BudgetRequestRepository budgetRequestRepository,
                             OpenAIClient openAIClient,
                             DepartmentClient departmentClient,
                             AuditClient auditClient,
                             InvoiceNumberService invoiceNumberService) {
        this.chartOfAccountRepository = chartOfAccountRepository;
        this.budgetRepository = budgetRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.accountPayableRepository = accountPayableRepository;
        this.accountReceivableRepository = accountReceivableRepository;
        this.budgetRequestRepository = budgetRequestRepository;
        this.openAIClient = openAIClient;
        this.departmentClient = departmentClient;
        this.auditClient = auditClient;
        this.invoiceNumberService = invoiceNumberService;
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
        // Validate required fields
        if (budget.getBudgetName() == null || budget.getBudgetName().isEmpty()) {
            throw new IllegalArgumentException("Budget name is required");
        }
        if (budget.getCreatedBy() == null) {
            throw new IllegalArgumentException("Created by is required");
        }
        
        // Ensure total_amount is set
        if (budget.getTotalAmount() == null || budget.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Budget amount must be greater than zero");
        }
        
        // Initialize spent_amount if null
        if (budget.getSpentAmount() == null) {
            budget.setSpentAmount(BigDecimal.ZERO);
        }
        
        // Initialize allocated_amount if null
        if (budget.getAllocatedAmount() == null) {
            budget.setAllocatedAmount(BigDecimal.ZERO);
        }
        
        // NEVER set remaining_amount - it's computed by DB
        budget.setRemainingAmount(null);
        
        // Set default status if not provided
        if (budget.getStatus() == null || budget.getStatus().isEmpty()) {
            budget.setStatus("draft");
        }
        
        Budget saved = budgetRepository.save(budget);
        auditClient.logAction(SYSTEM_USER_ID, "CREATE_BUDGET", "Budget: " + saved.getBudgetName() + ", Amount: " + saved.getTotalAmount());
        return saved;
    }

    private BigDecimal calculateRemainingAmount(Budget budget) {
        if (budget.getRemainingAmount() != null) {
            return budget.getRemainingAmount();
        }
        
        BigDecimal totalAmount = budget.getTotalAmount() != null ? budget.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal spentAmount = budget.getSpentAmount() != null ? budget.getSpentAmount() : BigDecimal.ZERO;
            
        return totalAmount.subtract(spentAmount);
    }
    
    private BigDecimal getBudgetAmount(Budget budget) {
        return budget.getTotalAmount() != null ? budget.getTotalAmount() : BigDecimal.ZERO;
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
            
            if (budget.getBudgetName() != null && !budget.getBudgetName().isEmpty()) {
                toUpdate.setBudgetName(budget.getBudgetName());
            }
            if (budget.getDescription() != null) {
                toUpdate.setDescription(budget.getDescription());
            }
            if (budget.getDepartmentId() != null) {
                toUpdate.setDepartmentId(budget.getDepartmentId());
            }
            if (budget.getFiscalYear() != null) {
                toUpdate.setFiscalYear(budget.getFiscalYear());
            }
            if (budget.getStartDate() != null) {
                toUpdate.setStartDate(budget.getStartDate());
            }
            if (budget.getEndDate() != null) {
                toUpdate.setEndDate(budget.getEndDate());
            }
            if (budget.getTotalAmount() != null) {
                if (budget.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
                    throw new IllegalArgumentException("Budget amount must be greater than zero");
                }
                toUpdate.setTotalAmount(budget.getTotalAmount());
            }
            if (budget.getAllocatedAmount() != null) {
                toUpdate.setAllocatedAmount(budget.getAllocatedAmount());
            }
            if (budget.getSpentAmount() != null) {
                toUpdate.setSpentAmount(budget.getSpentAmount());
            }
            toUpdate.setRemainingAmount(null);
            
            if (budget.getStatus() != null && !budget.getStatus().isEmpty()) {
                toUpdate.setStatus(budget.getStatus());
            }
            if (budget.getApprovedBy() != null) {
                toUpdate.setApprovedBy(budget.getApprovedBy());
            }
            if (budget.getApprovedAt() != null) {
                toUpdate.setApprovedAt(budget.getApprovedAt());
            }
            
            Budget updated = budgetRepository.save(toUpdate);
            auditClient.logAction(SYSTEM_USER_ID, "UPDATE_BUDGET", "Budget: " + updated.getBudgetName());
            return updated;
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
        // Auto-generate reference if not provided
        if (journalEntry.getReference() == null || journalEntry.getReference().isEmpty()) {
            journalEntry.setReference(generateJournalReference());
        }
        
        // Set default status if not provided
        if (journalEntry.getStatus() == null || journalEntry.getStatus().isEmpty()) {
            journalEntry.setStatus("Draft");
        }
        
        JournalEntry savedEntry = journalEntryRepository.save(journalEntry);
        auditClient.logAction(SYSTEM_USER_ID, "CREATE_JOURNAL_ENTRY", "Account: " + savedEntry.getAccountCode() + ", Amount: " + savedEntry.getAmount());
        detectAnomaly(savedEntry);
        return savedEntry;
    }

    private String generateJournalReference() {
        String datePrefix = "JE-" + java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        Long count = journalEntryRepository.countByReferencePrefix(datePrefix + "%");
        return String.format("%s-%04d", datePrefix, count + 1);
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
            auditClient.logAction(SYSTEM_USER_ID, "UPDATE_JOURNAL_ENTRY", "Account: " + updatedEntry.getAccountCode());
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
        // Auto-generate invoice number if not provided
        if (ap.getInvoiceNumber() == null || ap.getInvoiceNumber().isEmpty()) {
            ap.setInvoiceNumber(invoiceNumberService.generateAccountPayableInvoiceNumber());
        }
        
        // Set default values
        if (ap.getCreatedAt() == null) {
            ap.setCreatedAt(java.time.LocalDate.now());
        }
        if (ap.getIssueDate() == null) {
            ap.setIssueDate(java.time.LocalDate.now());
        }
        
        AccountPayable saved = accountPayableRepository.save(ap);
        auditClient.logAction(SYSTEM_USER_ID, "CREATE_ACCOUNT_PAYABLE", "Invoice: " + saved.getInvoiceNumber() + ", Vendor: " + saved.getVendorName() + ", Amount: " + saved.getAmount());
        return saved;
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
            
            // Don't allow invoice number to be changed once set
            if (ap.getVendorName() != null) {
                toUpdate.setVendorName(ap.getVendorName());
            }
            if (ap.getAmount() != null) {
                toUpdate.setAmount(ap.getAmount());
            }
            if (ap.getDueDate() != null) {
                toUpdate.setDueDate(ap.getDueDate());
            }
            if (ap.getDescription() != null) {
                toUpdate.setDescription(ap.getDescription());
            }
            if (ap.getStatus() != null) {
                toUpdate.setStatus(ap.getStatus());
            }
            if (ap.getCategory() != null) {
                toUpdate.setCategory(ap.getCategory());
            }
            if (ap.getPaymentTerms() != null) {
                toUpdate.setPaymentTerms(ap.getPaymentTerms());
            }
            
            AccountPayable updated = accountPayableRepository.save(toUpdate);
            auditClient.logAction(SYSTEM_USER_ID, "UPDATE_ACCOUNT_PAYABLE", "Invoice: " + updated.getInvoiceNumber());
            return updated;
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
        // Auto-generate invoice number if not provided
        if (ar.getInvoiceNumber() == null || ar.getInvoiceNumber().isEmpty()) {
            ar.setInvoiceNumber(invoiceNumberService.generateAccountReceivableInvoiceNumber());
        }
        
        // Set default values
        if (ar.getCreatedAt() == null) {
            ar.setCreatedAt(java.time.LocalDate.now());
        }
        if (ar.getIssueDate() == null) {
            ar.setIssueDate(java.time.LocalDate.now());
        }
        if (ar.getBalance() == null && ar.getAmount() != null) {
            ar.setBalance(ar.getAmount().subtract(ar.getAmountPaid() != null ? ar.getAmountPaid() : java.math.BigDecimal.ZERO));
        }
        
        AccountReceivable saved = accountReceivableRepository.save(ar);
        auditClient.logAction(SYSTEM_USER_ID, "CREATE_ACCOUNT_RECEIVABLE", "Invoice: " + saved.getInvoiceNumber() + ", Customer: " + saved.getCustomerName() + ", Amount: " + saved.getAmount());
        return saved;
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
            
            // Don't allow invoice number to be changed once set
            if (ar.getCustomerName() != null) {
                toUpdate.setCustomerName(ar.getCustomerName());
            }
            if (ar.getCustomerId() != null) {
                toUpdate.setCustomerId(ar.getCustomerId());
            }
            if (ar.getAmount() != null) {
                toUpdate.setAmount(ar.getAmount());
            }
            if (ar.getDueDate() != null) {
                toUpdate.setDueDate(ar.getDueDate());
            }
            if (ar.getDescription() != null) {
                toUpdate.setDescription(ar.getDescription());
            }
            if (ar.getStatus() != null) {
                toUpdate.setStatus(ar.getStatus());
            }
            if (ar.getPaymentTerms() != null) {
                toUpdate.setPaymentTerms(ar.getPaymentTerms());
            }
            if (ar.getAmountPaid() != null) {
                toUpdate.setAmountPaid(ar.getAmountPaid());
                // Recalculate balance
                toUpdate.setBalance(toUpdate.getAmount().subtract(ar.getAmountPaid()));
            }
            
            AccountReceivable updated = accountReceivableRepository.save(toUpdate);
            auditClient.logAction(SYSTEM_USER_ID, "UPDATE_ACCOUNT_RECEIVABLE", "Invoice: " + updated.getInvoiceNumber());
            return updated;
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
        if (budgetRequest.getRequestDate() == null) {
            budgetRequest.setRequestDate(java.time.LocalDate.now());
        }
        if (budgetRequest.getStatus() == null || budgetRequest.getStatus().isEmpty()) {
            budgetRequest.setStatus("Pending");
        }
        BudgetRequest saved = budgetRequestRepository.save(budgetRequest);
        auditClient.logAction(SYSTEM_USER_ID, "CREATE_BUDGET_REQUEST", "Department: " + saved.getDepartment() + ", Amount: " + saved.getRequestedAmount());
        return saved;
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

    // Invoice Number Generation
    @Override
    public String generateAccountPayableInvoiceNumber() {
        return invoiceNumberService.generateAccountPayableInvoiceNumber();
    }

    @Override
    public String generateAccountReceivableInvoiceNumber() {
        return invoiceNumberService.generateAccountReceivableInvoiceNumber();
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

