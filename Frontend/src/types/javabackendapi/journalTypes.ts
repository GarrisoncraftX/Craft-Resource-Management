export interface JournalEntry {
  id: string;
  entryDate: string;
  reference: string;
  status: 'Draft' | 'Posted' | 'Approved';
  totalDebit: number;
  totalCredit: number;
  createdBy: string;
  entries: JournalLineItem[];
  description: string;
  amount: number;
  accountCode: string;
}

export interface JournalEntryCreate {
  entryDate: string;
  description: string;
  amount: number;
  accountCode: string;
}

export type JournalEntryUpdate = Partial<JournalEntryCreate> & {
  status?: 'Draft' | 'Posted' | 'Approved';
};

export interface JournalLineItem {
  id: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
}

export interface JournalEntryFormData {
  id?: string;
  date: string;
  reference: string;
  amount: number;
  accountCode: string;
  description: string;
  entries: JournalLineItem[];
  totalDebit: number;
  totalCredit: number;
  status: 'Draft' | 'Posted' | 'Approved';
  createdBy: string;
}


