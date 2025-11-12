# TODO: Fix Journal Entries Display

## Tasks
- [x] Transform flat journal data into proper JournalEntry objects in journalApi.ts
- [x] Format dates for display in JournalEntries.tsx
- [x] Ensure reference, total amount, and created by are displayed correctly

## Details
- Group flat line items by entryDate and base description
- Generate reference IDs for each entry
- Calculate totalDebit and totalCredit
- Set status to 'Posted' and createdBy to '1'
- Format entryDate to readable format (e.g., MM/DD/YYYY)
