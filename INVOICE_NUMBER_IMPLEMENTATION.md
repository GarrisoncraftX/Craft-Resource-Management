# Auto-Generated Invoice Numbers Implementation

## Overview
This implementation provides auto-generated and auto-incremented invoice numbers for both Account Payable (AP) and Account Receivable (AR) modules in the Craft Resource Management system.

## Features
- **Thread-safe invoice number generation** using database-level pessimistic locking
- **Separate sequences** for AP and AR invoices
- **Date-based formatting**: `AP-YYYYMMDD-NNNN` and `AR-YYYYMMDD-NNNN`
- **Auto-increment functionality** with proper sequence management
- **Frontend integration** with auto-generation and manual regeneration options
- **Fallback mechanism** for offline scenarios

## Backend Implementation

### 1. Database Schema
- **New table**: `invoice_sequences` to track sequence numbers
- **Updated tables**: Enhanced `account_payables` and `account_receivables` with additional fields
- **Indexes**: Added for better performance on invoice lookups

### 2. New Entities
- `InvoiceSequence.java`: Manages sequence tracking for different invoice types

### 3. New Services
- `InvoiceNumberService.java`: Core service for generating invoice numbers
- `InvoiceSequenceRepository.java`: Repository with thread-safe operations

### 4. Updated Services
- `FinanceServiceImpl.java`: Enhanced to auto-generate invoice numbers on creation
- Added audit logging for invoice operations

### 5. New API Endpoints
- `GET /finance/invoice-numbers/account-payable/generate`: Generate AP invoice number
- `GET /finance/invoice-numbers/account-receivable/generate`: Generate AR invoice number

## Frontend Implementation

### 1. AccountsPayable.tsx Updates
- Auto-generates invoice numbers when creating new invoices
- Provides "Regenerate" button for manual regeneration
- Disables invoice number editing for existing invoices
- Shows loading state during generation

### 2. AccountsReceivable.tsx Updates
- Same auto-generation features as AP
- Consistent UI/UX across both modules
- Fallback to timestamp-based numbers if API fails

## Invoice Number Format

### Account Payable
- Format: `AP-YYYYMMDD-NNNN`
- Example: `AP-20240118-0001`

### Account Receivable
- Format: `AR-YYYYMMDD-NNNN`
- Example: `AR-20240118-0001`

## Key Benefits

1. **Consistency**: Standardized invoice numbering across the system
2. **Thread Safety**: Prevents duplicate invoice numbers in concurrent scenarios
3. **Audit Trail**: All invoice operations are logged
4. **User Experience**: Seamless auto-generation with manual override option
5. **Scalability**: Separate sequences allow independent scaling
6. **Reliability**: Fallback mechanisms ensure system continues working

## Database Migration

Run the provided SQL script (`invoice_sequences_migration.sql`) to:
- Create the `invoice_sequences` table
- Initialize AP and AR sequences
- Add missing columns to existing tables
- Create performance indexes

## Usage

### Creating New Invoices
1. Open Account Payable or Account Receivable module
2. Click "Add Invoice" or "Create Invoice"
3. Invoice number is automatically generated
4. Use "Regenerate" button if needed
5. Fill in other required fields and submit

### Existing Invoices
- Invoice numbers cannot be changed once created
- All updates preserve the original invoice number
- Audit logs track all modifications

## Technical Notes

- Uses pessimistic locking to prevent race conditions
- Sequences are database-managed for consistency
- Frontend includes error handling and fallback mechanisms
- API endpoints are secured with existing authentication
- Compatible with existing permission system

## Testing

The implementation includes:
- Unit tests for invoice number generation
- Thread safety validation
- Error handling verification
- Frontend integration testing

## Future Enhancements

Potential improvements:
- Custom invoice number formats per department
- Yearly sequence reset functionality
- Bulk invoice number generation
- Integration with external accounting systems