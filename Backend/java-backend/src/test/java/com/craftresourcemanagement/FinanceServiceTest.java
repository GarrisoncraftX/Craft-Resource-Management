package com.craftresourcemanagement;

import com.craftresourcemanagement.finance.entities.Budget;
import com.craftresourcemanagement.finance.entities.AccountPayable;
import com.craftresourcemanagement.finance.dto.BudgetResponse;
import com.craftresourcemanagement.finance.repositories.BudgetRepository;
import com.craftresourcemanagement.finance.repositories.AccountPayableRepository;
import com.craftresourcemanagement.finance.services.impl.FinanceServiceImpl;
import com.craftresourcemanagement.finance.services.impl.DepartmentClient;
import com.craftresourcemanagement.finance.services.InvoiceNumberService;
import com.craftresourcemanagement.utils.OpenAIClient;
import com.craftresourcemanagement.utils.AuditClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinanceServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private AccountPayableRepository accountPayableRepository;

    @Mock
    private DepartmentClient departmentClient;

    @Mock
    private InvoiceNumberService invoiceNumberService;

    @Mock
    private OpenAIClient openAIClient;

    @Mock
    private AuditClient auditClient;

    @InjectMocks
    private FinanceServiceImpl financeService;

    private Budget testBudget;
    private AccountPayable testAccountPayable;

    @BeforeEach
    void setUp() {
        financeService = new FinanceServiceImpl(null, budgetRepository, null, accountPayableRepository, 
            null, null, openAIClient, departmentClient, auditClient, invoiceNumberService);
        
        testBudget = new Budget();
        testBudget.setBudgetName("Test Budget");
        testBudget.setFiscalYear(2024);
        testBudget.setTotalAmount(new BigDecimal("100000.00"));
        testBudget.setSpentAmount(new BigDecimal("25000.00"));
        testBudget.setStatus("ACTIVE");

        testAccountPayable = new AccountPayable();
        testAccountPayable.setVendorName("Test Vendor");
        testAccountPayable.setAmount(new BigDecimal("5000.00"));
        testAccountPayable.setDueDate(LocalDate.now().plusDays(30));
        testAccountPayable.setStatus("PENDING");
    }

    @Test
    void testGetAllBudgets_Success() {
        List<Budget> mockBudgets = Arrays.asList(testBudget);
        when(budgetRepository.findAll()).thenReturn(mockBudgets);

        List<BudgetResponse> result = financeService.getAllBudgets();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(budgetRepository, times(1)).findAll();
    }

    @Test
    void testGetBudgetById_Success() {
        // Arrange
        when(budgetRepository.findById(1L)).thenReturn(Optional.of(testBudget));

        // Act
        Budget result = financeService.getBudgetById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(new BigDecimal("100000.00"), result.getTotalAmount());
        verify(budgetRepository, times(1)).findById(1L);
    }

    @Test
    void testCreateBudget_Success() {
        // Arrange
        testBudget.setCreatedBy(1L);
        when(budgetRepository.save(any(Budget.class))).thenReturn(testBudget);

        // Act
        Budget result = financeService.createBudget(testBudget);

        // Assert
        assertNotNull(result);
        assertEquals("ACTIVE", result.getStatus());
        verify(budgetRepository, times(1)).save(any(Budget.class));
    }

    @Test
    void testUpdateBudget_Success() {
        // Arrange
        Budget updatedBudget = new Budget();
        updatedBudget.setTotalAmount(new BigDecimal("120000.00"));

        when(budgetRepository.findById(1L)).thenReturn(Optional.of(testBudget));
        
        testBudget.setTotalAmount(new BigDecimal("120000.00"));
        when(budgetRepository.save(any(Budget.class))).thenReturn(testBudget);

        // Act
        Budget result = financeService.updateBudget(1L, updatedBudget);

        // Assert
        assertNotNull(result);
        assertEquals(new BigDecimal("120000.00"), result.getTotalAmount());
        verify(budgetRepository, times(1)).save(any(Budget.class));
    }



    @Test
    void testCreateAccountPayable_Success() {
        // Arrange
        when(accountPayableRepository.save(any(AccountPayable.class))).thenReturn(testAccountPayable);

        // Act
        AccountPayable result = financeService.createAccountPayable(testAccountPayable);

        // Assert
        assertNotNull(result);
        assertEquals("Test Vendor", result.getVendorName());
        assertEquals("PENDING", result.getStatus());
        verify(accountPayableRepository, times(1)).save(any(AccountPayable.class));
    }






}
