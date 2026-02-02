export interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  account?: any;
  onSubmit: (data: any) => void;
}

export interface BudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  budget?: any;
  onSubmit: (data: any) => void;
}

export interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: any;
  onSubmit: (data: any) => void;
}

export interface JournalEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  entry?: any;
  onSubmit: (data: any) => void;
}
