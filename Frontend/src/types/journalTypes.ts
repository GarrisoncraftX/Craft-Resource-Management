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
  status?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JournalEntryLine {
  id?: number | string;
  journalEntryId?: number | string;
  accountId?: number | string;
  accountName?: string;
  debit?: number;
  credit?: number;
  description?: string;
}