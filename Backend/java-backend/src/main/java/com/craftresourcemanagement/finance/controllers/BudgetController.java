package com.craftresourcemanagement.finance.controllers;

import com.craftresourcemanagement.finance.entities.Budget;
import com.craftresourcemanagement.finance.services.FinanceService;
import com.craftresourcemanagement.finance.dto.BudgetResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final FinanceService financeService;

    @Autowired
    public BudgetController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getAllBudgets() {
        List<BudgetResponse> budgets = financeService.getAllBudgets();
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetResponse> getBudgetById(@PathVariable Long id) {
        Optional<Budget> budgetOpt = Optional.ofNullable(financeService.getBudgetById(id));
        if (budgetOpt.isPresent()) {
            Budget budget = budgetOpt.get();
            BudgetResponse response = new BudgetResponse.Builder()
                .id(budget.getId())
                .budgetName(budget.getBudgetName())
                .amount(budget.getTotalAmount())
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .description(budget.getDescription())
                .departmentId(budget.getDepartmentId())
                .spentAmount(budget.getSpentAmount())
                .build();
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Budget> createBudget(@RequestBody Budget budget) {
        Budget created = financeService.createBudget(budget);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(@PathVariable Long id, @RequestBody Budget budget) {
        Budget updated = financeService.updateBudget(id, budget);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        financeService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}
