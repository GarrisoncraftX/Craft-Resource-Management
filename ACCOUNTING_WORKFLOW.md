# Accounting Workflow - Finance Management System

## What Happens Now (After Implementation)

### Accounts Payable (AP) - Vendor Invoices

#### 1. **Create Invoice** (Status: Pending)
- User enters vendor invoice details
- Invoice is saved with status "Pending"
- **No journal entry created yet**

#### 2. **Approve Invoice** (Status: Approved)
- Manager approves the invoice
- **Journal Entry Created:**
  ```
  Debit:  Expense Account     $X,XXX
  Credit: Accounts Payable    $X,XXX
  ```
- This records the liability (you owe the vendor)
- Reference: "AP-{InvoiceNumber}"

#### 3. **Pay Invoice** (Status: Paid)
- Payment is made to vendor
- **Journal Entry Created:**
  ```
  Debit:  Accounts Payable    $X,XXX
  Credit: Cash/Bank Account   $X,XXX
  ```
- This clears the liability and reduces cash
- Reference: "PMT-{InvoiceNumber}"

---

### Accounts Receivable (AR) - Customer Invoices

#### 1. **Create Invoice** (Status: Draft)
- User creates customer invoice
- Invoice is saved with status "Draft"
- **No journal entry created yet**

#### 2. **Send Invoice** (Status: Sent)
- Invoice is sent to customer
- **Journal Entry Created:**
  ```
  Debit:  Accounts Receivable $X,XXX
  Credit: Revenue Account     $X,XXX
  ```
- This records the asset (customer owes you)
- Reference: "AR-{InvoiceNumber}"

#### 3. **Record Payment** (Status: Paid/Partial)
- Customer pays the invoice
- **Journal Entry Created:**
  ```
  Debit:  Cash/Bank Account       $X,XXX
  Credit: Accounts Receivable     $X,XXX
  ```
- This increases cash and reduces receivables
- Reference: "PMT-{InvoiceNumber}"

---

## Double-Entry Bookkeeping Principles

Every transaction affects at least two accounts:
- **Debit** = Left side (increases assets/expenses, decreases liabilities/revenue)
- **Credit** = Right side (increases liabilities/revenue, decreases assets/expenses)

### Account Types:
- **Assets**: Cash, Accounts Receivable (what you own)
- **Liabilities**: Accounts Payable (what you owe)
- **Revenue**: Sales, Service Income (what you earn)
- **Expenses**: Rent, Utilities, Supplies (what you spend)

---

## System Integration

### Journal Entries
All journal entries are automatically created and stored in the `journal_entries` table with:
- Entry date
- Description
- Amount
- Account code
- Reference number
- Status (Posted)
- Debit/Credit totals

### Chart of Accounts
The system uses account codes to categorize transactions:
- **1000-1999**: Assets (e.g., 1200 = Accounts Receivable)
- **2000-2999**: Liabilities (e.g., 2100 = Accounts Payable)
- **3000-3999**: Equity
- **4000-4999**: Revenue
- **5000-5999**: Expenses

---

## Benefits

1. **Audit Trail**: Every financial transaction is recorded with journal entries
2. **Financial Reports**: Can generate Balance Sheet, Income Statement, Cash Flow
3. **Compliance**: Follows standard accounting principles (GAAP)
4. **Transparency**: Clear visibility of all financial movements
5. **Accuracy**: Double-entry ensures books always balance (Debits = Credits)

---

## Future Enhancements

- Payment method selection (Cash, Check, Bank Transfer)
- Partial payment support for AP
- Automatic overdue detection and notifications
- Integration with bank accounts for reconciliation
- Multi-currency support
- Tax calculation and tracking
