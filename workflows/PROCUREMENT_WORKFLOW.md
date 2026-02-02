# Procurement Workflow - Purchase Management System

## Purchase Request to Payment Cycle

### 1. **Purchase Requisition**

#### Create Purchase Request (Status: Draft)
- Employee/Department identifies need
- Item details specified:
  - Description and quantity
  - Estimated cost
  - Justification/purpose
  - Required delivery date
  - Budget code
- Supporting documents attached

#### Submit for Approval (Status: Pending Approval)
- Request submitted to manager
- Budget availability checked
- Priority level assigned

#### Approval Chain (Status: Under Review)
- **Level 1**: Department Manager (< $5,000)
- **Level 2**: Finance Manager ($5,000 - $25,000)
- **Level 3**: Director/CEO (> $25,000)
- **If Rejected**: Returned with comments
- **If Approved**: Moves to procurement team

---

### 2. **Vendor Selection**

#### Identify Vendors (Status: Vendor Selection)
- Procurement team searches vendor database
- Request for Quotation (RFQ) sent to vendors
- Minimum 3 quotes required (for high-value items)

#### Evaluate Quotations (Status: Quote Comparison)
- Compare vendor proposals:
  - Price
  - Quality
  - Delivery time
  - Payment terms
  - Warranty/support
- **Scoring Matrix**: Weighted evaluation

#### Select Vendor (Status: Vendor Selected)
- Best vendor chosen
- Negotiation (if needed)
- Vendor approval documented

---

### 3. **Purchase Order Creation**

#### Generate PO (Status: PO Draft)
- Purchase Order created with:
  - PO number (auto-generated)
  - Vendor details
  - Item specifications
  - Quantities and unit prices
  - Total amount
  - Delivery address and date
  - Payment terms
  - Terms and conditions

#### Approve PO (Status: PO Approved)
- Finance reviews and approves
- **Budget Encumbrance**:
  ```
  Reserve budget amount for this PO
  Available Budget = Total Budget - Encumbered Amount
  ```

#### Send PO to Vendor (Status: PO Sent)
- PO emailed/sent to vendor
- Vendor acknowledgment received
- Delivery schedule confirmed
- **Integration**: Vendor portal notification

---

### 4. **Goods Receipt**

#### Delivery Notification (Status: In Transit)
- Vendor notifies shipment
- Tracking information provided
- Expected delivery date updated

#### Receive Goods (Status: Received)
- Goods delivered to receiving dock
- Goods Receipt Note (GRN) created
- **Inspection Process**:
  - Quantity verification (vs. PO)
  - Quality inspection
  - Damage check
  - Serial numbers recorded (if applicable)

#### Quality Check (Status: Under Inspection)
- **If Passed**: Accept goods
- **If Failed**: 
  - Reject goods
  - Return to vendor
  - Replacement requested

#### Accept Goods (Status: Accepted)
- GRN finalized
- Goods moved to warehouse/department
- **Inventory Updated**: Stock levels increased
- **Triggers**: Notify requester, update asset register (if fixed asset)

---

### 5. **Invoice Processing**

#### Receive Vendor Invoice (Status: Invoice Received)
- Vendor submits invoice
- Invoice details captured

#### Three-Way Match (Status: Under Verification)
- **Match Check**:
  1. Purchase Order (what was ordered)
  2. Goods Receipt Note (what was received)
  3. Vendor Invoice (what is being billed)
- **Verify**: Quantities, prices, totals
- **Discrepancies**: Flag for resolution

#### Approve Invoice (Status: Invoice Approved)
- **If Match Successful**: Approve for payment
- **Journal Entry Created**:
  ```
  Debit:  Inventory/Expense Account  $X,XXX
  Debit:  Tax (if applicable)        $XXX
  Credit: Accounts Payable           $X,XXX
  ```
- **Integration**: Feeds to Finance AP module

---

### 6. **Payment Processing**

#### Schedule Payment (Status: Payment Scheduled)
- Payment date determined (per terms)
- Payment method selected
- **Payment Terms Examples**:
  - Net 30: Pay within 30 days
  - 2/10 Net 30: 2% discount if paid in 10 days
  - COD: Cash on delivery

#### Process Payment (Status: Paid)
- Payment executed
- **Journal Entry Created**:
  ```
  Debit:  Accounts Payable    $X,XXX
  Credit: Cash/Bank           $X,XXX
  ```
- Payment confirmation sent to vendor
- **Updates**: Vendor payment history

---

## Vendor Management

### Vendor Registration (Status: New Vendor)
- Vendor submits registration form
- Documents collected:
  - Business license
  - Tax certificates
  - Bank details
  - References
- Due diligence performed

### Vendor Approval (Status: Approved Vendor)
- Procurement reviews application
- Credit check performed
- Vendor added to approved list
- Vendor code assigned

### Vendor Performance Tracking
- **Metrics Tracked**:
  - On-time delivery rate
  - Quality acceptance rate
  - Price competitiveness
  - Responsiveness
  - Compliance with terms
- **Rating System**: 1-5 stars
- **Actions**: 
  - Top performers: Preferred vendor status
  - Poor performers: Warning, suspension, removal

### Vendor Review (Periodic)
- Quarterly/annual performance review
- Contract renewal decisions
- Renegotiate terms if needed

---

## Special Procurement Types

### Emergency Purchases
- Expedited approval process
- Single-source justification allowed
- Post-purchase documentation required

### Blanket Purchase Orders
- For recurring purchases
- Pre-approved spending limit
- Multiple releases against single PO
- **Use Case**: Office supplies, maintenance parts

### Contract Management
- Long-term supply agreements
- Annual contracts with call-offs
- Price protection clauses
- Performance guarantees

---

## Key Integrations

### With Finance Module
- Budget checking and encumbrance
- Accounts payable integration
- Payment processing
- Expense tracking

### With Inventory Module
- Stock level updates on receipt
- Reorder point triggers
- Inventory valuation

### With Asset Module
- Fixed asset purchases
- Asset registration on receipt

### With Vendor Portal
- RFQ distribution
- Quote submission
- PO acknowledgment
- Invoice submission

---

## Automated Workflows

1. **Approval Routing**: Auto-route based on amount thresholds
2. **Budget Alerts**: Notify if budget exceeded
3. **Vendor Notifications**: Auto-send POs, reminders
4. **Delivery Reminders**: Alert on expected delivery dates
5. **Payment Due Alerts**: Notify before payment due date
6. **Discount Opportunities**: Alert for early payment discounts
7. **Overdue PO Alerts**: Flag delayed deliveries
8. **Contract Expiry**: Remind before contract ends

---

## Reports & Analytics

- Purchase order status report
- Vendor performance scorecard
- Spend analysis (by category, vendor, department)
- Budget vs. actual spending
- Purchase cycle time analysis
- Pending approvals dashboard
- Goods receipt pending report
- Payment due schedule
- Savings from negotiations
- Maverick spending (off-contract purchases)

---

## Compliance & Controls

- Segregation of duties (requester ≠ approver ≠ receiver)
- Competitive bidding requirements
- Conflict of interest declarations
- Vendor code of conduct
- Anti-corruption policies
- Audit trail for all transactions
- Document retention policies
- Supplier diversity programs
