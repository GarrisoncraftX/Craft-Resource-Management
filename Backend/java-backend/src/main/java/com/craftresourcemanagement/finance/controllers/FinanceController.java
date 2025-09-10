package com.craftresourcemanagement.finance.controllers;

import com.craftresourcemanagement.finance.entities.*;
import com.craftresourcemanagement.finance.services.FinanceService;
import com.craftresourcemanagement.finance.dto.BudgetResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/finance")
public class FinanceController {

    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    // Chart of Account endpoints
    @PostMapping("/accounts")
    public ResponseEntity<ChartOfAccount> createChartOfAccount(@RequestBody ChartOfAccount coa) {
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
}
