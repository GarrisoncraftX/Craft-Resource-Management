export interface JournalEntry {
  id?: number | string;
  entryNumber?: string;
  reference?: string;
  date?: string;
  entryDate?: string;
  description: string;
  debitAccount?: string;
  creditAccount?: string;
  accountCode?: string;
  amount: number;
  debit?: number;
  credit?: number;
  status?: 'Draft' | 'Posted' | 'Approved';
  totalDebit?: number;
  totalCredit?: number;
  entries?: JournalEntryLine[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JournalEntryLine {
  id?: number | string;
  journalEntryId?: number | string;
  accountId?: number | string;
  accountCode?: string;
  accountName?: string;
  debit?: number;
  credit?: number;
  description?: string;
}
