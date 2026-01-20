package com.craftresourcemanagement.finance.controllers;

import com.craftresourcemanagement.finance.entities.*;
import com.craftresourcemanagement.finance.services.FinanceService;
import com.craftresourcemanagement.finance.dto.BudgetResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/finance")
public class FinanceController {

    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    // Chart of Account endpoints
    @PostMapping("/accounts")
    public ResponseEntity<ChartOfAccount> createChartOfAccount(
            @RequestBody ChartOfAccount coa,
            @RequestHeader(value = "x-user-id", required = false) String userId) {
        if (userId != null) {
            coa.setCreatedBy(userId);
        }
        return ResponseEntity.ok(financeService.createChartOfAccount(coa));
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<ChartOfAccount>> getAllChartOfAccounts() {
        return ResponseEntity.ok(financeService.getAllChartOfAccounts());
    }

    @GetMapping("/accounts/{id}")
    public ResponseEntity<ChartOfAccount> getChartOfAccountById(@PathVariable Long id) {
        ChartOfAccount coa = financeService.getChartOfAccountById(id);
        if (coa == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(coa);
    }

    @PutMapping("/accounts/{id}")
    public ResponseEntity<ChartOfAccount> updateChartOfAccount(@PathVariable Long id, @RequestBody ChartOfAccount coa) {
        ChartOfAccount updated = financeService.updateChartOfAccount(id, coa);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/accounts/{id}")
    public ResponseEntity<Void> deleteChartOfAccount(@PathVariable Long id) {
        financeService.deleteChartOfAccount(id);
        return ResponseEntity.noContent().build();
    }

    // Budget endpoints
    @PostMapping("/budgets")
    public ResponseEntity<Budget> createBudget(@RequestBody Budget budget) {
        return ResponseEntity.ok(financeService.createBudget(budget));
    }


    @GetMapping("/budgets")
    public ResponseEntity<List<BudgetResponse>> getAllBudgets() {
        List<BudgetResponse> budgets = financeService.getAllBudgets();
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/budgets/{id}")
    public ResponseEntity<Budget> getBudgetById(@PathVariable Long id) {
        Budget budget = financeService.getBudgetById(id);
        if (budget == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(budget);
    }

    @PutMapping("/budgets/{id}")
    public ResponseEntity<Budget> updateBudget(@PathVariable Long id, @RequestBody Budget budget) {
        Budget updated = financeService.updateBudget(id, budget);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/budgets/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        Budget budget = financeService.getBudgetById(id);
        if (budget == null) {
            return ResponseEntity.notFound().build();
        }
        financeService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }

    // Budget Request endpoints
    @PostMapping("/budget-requests")
    public ResponseEntity<BudgetRequest> createBudgetRequest(@RequestBody BudgetRequest budgetRequest) {
        return ResponseEntity.ok(financeService.createBudgetRequest(budgetRequest));
    }

    @GetMapping("/budget-requests")
    public ResponseEntity<List<BudgetRequest>> getAllBudgetRequests() {
        return ResponseEntity.ok(financeService.getAllBudgetRequests());
    }

    @GetMapping("/budget-requests/{id}")
    public ResponseEntity<BudgetRequest> getBudgetRequestById(@PathVariable Long id) {
        BudgetRequest budgetRequest = financeService.getBudgetRequestById(id);
        if (budgetRequest == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(budgetRequest);
    }

    @PutMapping("/budget-requests/{id}")
    public ResponseEntity<BudgetRequest> updateBudgetRequest(@PathVariable Long id, @RequestBody BudgetRequest budgetRequest) {
        BudgetRequest updated = financeService.updateBudgetRequest(id, budgetRequest);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/budget-requests/{id}")
    public ResponseEntity<Void> deleteBudgetRequest(@PathVariable Long id) {
        financeService.deleteBudgetRequest(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/budget-requests/{id}/approve")
    public ResponseEntity<BudgetRequest> approveBudgetRequest(
            @PathVariable Long id,
            @RequestHeader(value = "x-user-id", required = false) String userId) {
        BudgetRequest request = financeService.getBudgetRequestById(id);
        if (request == null) {
            return ResponseEntity.notFound().build();
        }
        request.setStatus("Approved");
        BudgetRequest updated = financeService.updateBudgetRequest(id, request);
        
        // Create budget from approved request
        Budget budget = new Budget();
        budget.setBudgetName(request.getCategory() + " - " + request.getDepartment());
        budget.setDescription(request.getJustification());
        budget.setDepartmentId(request.getDepartmentId() != null ? request.getDepartmentId() : 1L);
        budget.setFiscalYear(java.time.LocalDate.now().getYear());
        budget.setStartDate(java.time.LocalDate.now());
        budget.setEndDate(java.time.LocalDate.now().plusYears(1));
        budget.setTotalAmount(java.math.BigDecimal.valueOf(request.getRequestedAmount()));
        budget.setAllocatedAmount(java.math.BigDecimal.valueOf(request.getRequestedAmount()));
        budget.setSpentAmount(java.math.BigDecimal.ZERO);
        budget.setStatus("Active");
        budget.setCreatedBy(userId != null ? Long.parseLong(userId) : 1L);
        financeService.createBudget(budget);
        
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/budget-requests/{id}/reject")
    public ResponseEntity<BudgetRequest> rejectBudgetRequest(@PathVariable Long id) {
        BudgetRequest request = financeService.getBudgetRequestById(id);
        if (request == null) {
            return ResponseEntity.notFound().build();
        }
        request.setStatus("Rejected");
        BudgetRequest updated = financeService.updateBudgetRequest(id, request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/budget-requests/migrate-approved")
    public ResponseEntity<Map<String, Object>> migrateApprovedRequests(@RequestHeader(value = "x-user-id", required = false) String userId) {
        List<BudgetRequest> approvedRequests = financeService.getAllBudgetRequests().stream()
            .filter(r -> "Approved".equals(r.getStatus()))
            .toList();
        
        int created = 0;
        for (BudgetRequest request : approvedRequests) {
            Budget budget = new Budget();
            budget.setBudgetName(request.getCategory() + " - " + request.getDepartment());
            budget.setDescription(request.getJustification());
            budget.setDepartmentId(request.getDepartmentId() != null ? request.getDepartmentId() : 1L);
            budget.setFiscalYear(java.time.LocalDate.now().getYear());
            budget.setStartDate(request.getRequestDate() != null ? request.getRequestDate() : java.time.LocalDate.now());
            budget.setEndDate(budget.getStartDate().plusYears(1));
            budget.setTotalAmount(java.math.BigDecimal.valueOf(request.getRequestedAmount()));
            budget.setAllocatedAmount(java.math.BigDecimal.valueOf(request.getRequestedAmount()));
            budget.setSpentAmount(java.math.BigDecimal.ZERO);
            budget.setStatus("Active");
            budget.setCreatedBy(userId != null ? Long.parseLong(userId) : 1L);
            financeService.createBudget(budget);
            created++;
        }
        
        return ResponseEntity.ok(Map.of("message", created + " budgets created from approved requests", "count", created));
    }

    // Journal Entry endpoints
    @PostMapping("/journal-entries")
    public ResponseEntity<JournalEntry> createJournalEntry(@RequestBody JournalEntry journalEntry) {
        return ResponseEntity.ok(financeService.createJournalEntry(journalEntry));
    }

    @GetMapping("/journal-entries")
    public ResponseEntity<List<JournalEntry>> getAllJournalEntries() {
        return ResponseEntity.ok(financeService.getAllJournalEntries());
    }

    @GetMapping("/journal-entries/{id}")
    public ResponseEntity<JournalEntry> getJournalEntryById(@PathVariable Long id) {
        JournalEntry je = financeService.getJournalEntryById(id);
        if (je == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(je);
    }

    @PutMapping("/journal-entries/{id}")
    public ResponseEntity<JournalEntry> updateJournalEntry(@PathVariable Long id, @RequestBody JournalEntry journalEntry) {
        JournalEntry updated = financeService.updateJournalEntry(id, journalEntry);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/journal-entries/{id}")
    public ResponseEntity<Void> deleteJournalEntry(@PathVariable Long id) {
        financeService.deleteJournalEntry(id);
        return ResponseEntity.noContent().build();
    }

    // Account Payable endpoints
    @PostMapping("/account-payables")
    public ResponseEntity<AccountPayable> createAccountPayable(@RequestBody AccountPayable ap) {
        return ResponseEntity.ok(financeService.createAccountPayable(ap));
    }

    @GetMapping("/account-payables")
    public ResponseEntity<List<AccountPayable>> getAllAccountPayables() {
        return ResponseEntity.ok(financeService.getAllAccountPayables());
    }

    @GetMapping("/account-payables/{id}")
    public ResponseEntity<AccountPayable> getAccountPayableById(@PathVariable Long id) {
        AccountPayable ap = financeService.getAccountPayableById(id);
        if (ap == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ap);
    }

    @PutMapping("/account-payables/{id}")
    public ResponseEntity<AccountPayable> updateAccountPayable(@PathVariable Long id, @RequestBody AccountPayable ap) {
        AccountPayable updated = financeService.updateAccountPayable(id, ap);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/account-payables/{id}")
    public ResponseEntity<Void> deleteAccountPayable(@PathVariable Long id) {
        financeService.deleteAccountPayable(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/account-payables/{id}/status")
    public ResponseEntity<AccountPayable> updateAccountPayableStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        AccountPayable ap = financeService.getAccountPayableById(id);
        if (ap == null) {
            return ResponseEntity.notFound().build();
        }
        ap.setStatus(statusUpdate.get("status"));
        return ResponseEntity.ok(financeService.updateAccountPayable(id, ap));
    }

    // Account Receivable endpoints
    @PostMapping("/account-receivables")
    public ResponseEntity<AccountReceivable> createAccountReceivable(@RequestBody AccountReceivable ar) {
        return ResponseEntity.ok(financeService.createAccountReceivable(ar));
    }

    @GetMapping("/account-receivables")
    public ResponseEntity<List<AccountReceivable>> getAllAccountReceivables() {
        return ResponseEntity.ok(financeService.getAllAccountReceivables());
    }

    @GetMapping("/account-receivables/{id}")
    public ResponseEntity<AccountReceivable> getAccountReceivableById(@PathVariable Long id) {
        AccountReceivable ar = financeService.getAccountReceivableById(id);
        if (ar == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ar);
    }

    @PutMapping("/account-receivables/{id}")
    public ResponseEntity<AccountReceivable> updateAccountReceivable(@PathVariable Long id, @RequestBody AccountReceivable ar) {
        AccountReceivable updated = financeService.updateAccountReceivable(id, ar);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/account-receivables/{id}")
    public ResponseEntity<Void> deleteAccountReceivable(@PathVariable Long id) {
        financeService.deleteAccountReceivable(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/account-receivables/{id}/status")
    public ResponseEntity<AccountReceivable> updateAccountReceivableStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        AccountReceivable ar = financeService.getAccountReceivableById(id);
        if (ar == null) {
            return ResponseEntity.notFound().build();
        }
        ar.setStatus(statusUpdate.get("status"));
        return ResponseEntity.ok(financeService.updateAccountReceivable(id, ar));
    }

    // Invoice Number Generation endpoints
    @GetMapping("/invoice-numbers/account-payable/generate")
    public ResponseEntity<Map<String, String>> generateAccountPayableInvoiceNumber() {
        String invoiceNumber = financeService.generateAccountPayableInvoiceNumber();
        return ResponseEntity.ok(Map.of("invoiceNumber", invoiceNumber, "type", "Account Payable"));
    }

    @GetMapping("/invoice-numbers/account-receivable/generate")
    public ResponseEntity<Map<String, String>> generateAccountReceivableInvoiceNumber() {
        String invoiceNumber = financeService.generateAccountReceivableInvoiceNumber();
        return ResponseEntity.ok(Map.of("invoiceNumber", invoiceNumber, "type", "Account Receivable"));
    }
}
