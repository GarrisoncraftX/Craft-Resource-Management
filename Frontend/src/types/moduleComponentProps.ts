// Planning Module Props
export interface PermitFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  permit?: any;
  onSubmit: (data: any) => void;
}

export interface PolicyFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  policy?: any;
  onSubmit: (data: any) => void;
}

export interface ProjectFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project?: any;
  onSubmit: (data: any) => void;
}

export interface StrategicGoalFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: any;
  onSubmit: (data: any) => void;
}

export interface UrbanPlanFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: any;
  onSubmit: (data: any) => void;
}

// Procurement Module Props
export interface ContractFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: any;
  onSubmit: (data: any) => void;
}

export interface ProcurementPlanFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: any;
  onSubmit: (data: any) => void;
}

export interface RequisitionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requisition?: any;
  onSubmit: (data: any) => void;
}

export interface TenderFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tender?: any;
  onSubmit: (data: any) => void;
}

export interface VendorFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vendor?: any;
  onSubmit: (data: any) => void;
}

// Public Relations Module Props
export interface MediaContactFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: any;
  onSubmit: (data: any) => void;
}

export interface PressReleaseFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  release?: any;
  onSubmit: (data: any) => void;
}

export interface PublicEventFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event?: any;
  onSubmit: (data: any) => void;
}

export interface SocialMediaPostFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post?: any;
  onSubmit: (data: any) => void;
}

export interface SocialPost {
  id: string | number;
  platform: string;
  content: string;
  scheduledDate: string;
  status: 'scheduled' | 'published' | 'draft' | string;
}

// Revenue Module Props
export interface BusinessPermitFormProps {
  isOpen: boolean;
  onClose: () => void;
  permit?: any;
  onSubmit: (data: any) => void;
}

export interface RevenueCollectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  collection?: any;
  onSubmit: (data: any) => void;
}

export interface TaxAssessmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  assessment?: any;
  onSubmit: (data: any) => void;
}

// Transportation Module Props
export interface DriverFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  driver?: any;
  onSubmit: (data: any) => void;
}

export interface MaintenanceFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  maintenance?: any;
  onSubmit: (data: any) => void;
}

export interface FuelFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fuel?: any;
  onSubmit: (data: any) => void;
}

export interface TripFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trip?: any;
  onSubmit: (data: any) => void;
}

export interface VehicleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: any;
  onSubmit: (data: any) => void;
}

// Security Module Props
export interface GuardPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post?: any;
  onSubmit: (data: any) => void;
}

export interface SOPDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sop?: any;
  onSubmit: (data: any) => void;
}

// Assets Module Props
export interface AssetFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset?: any;
  onSubmit: (data: any) => void;
}
