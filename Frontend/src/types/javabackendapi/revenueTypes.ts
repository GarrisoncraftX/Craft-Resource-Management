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

export interface BusinessPermit {
  id?: number;
  businessName: string;
  businessType: string;
  ownerName: string;
  address: string;
  permitNumber: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  fee: number;
}
