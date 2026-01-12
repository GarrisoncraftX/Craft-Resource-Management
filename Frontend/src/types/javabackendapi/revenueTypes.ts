export interface TaxAssessment {
  id?: number;
  taxpayerId: string;
  taxYear: number;
  assessedAmount: number;
  paidAmount: number;
  dueDate: string;
  status: string;
}

export interface RevenueCollection {
  id?: number;
  taxpayerId: string;
  amount: number;
  collectionDate: string;
  paymentMethod: string;
  referenceNumber: string;
}
