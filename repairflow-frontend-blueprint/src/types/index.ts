// Domain types for Repair Shop Management System

export type Role = 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'CASHIER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
}

export type RepairStatus =
  | 'RECEIVED'
  | 'DIAGNOSING'
  | 'WAITING_FOR_APPROVAL'
  | 'APPROVED'
  | 'WAITING_FOR_PARTS'
  | 'IN_REPAIR'
  | 'QUALITY_CHECK'
  | 'READY_FOR_PICKUP'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'UNABLE_TO_REPAIR';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Customer {
  id: string;
  code: string; // e.g. CUS-000045
  name: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
  createdAt: string;
  totalRepairs?: number;
  totalSpent?: number;
}

export interface Technician {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  specialization: string; // e.g. 'Apple & Logic Boards', 'Screen & Battery', 'Water Damage Recovery'
  status: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  activeRepairsCount: number;
  completedRepairsCount: number;
  rating: number;
  avatar?: string;
}

export interface Product {
  id: string;
  brand: string;
  model: string;
  category: 'Smartphone' | 'Laptop' | 'Tablet' | 'Smartwatch' | 'Gaming Console' | 'Audio/Other';
  releaseYear?: number;
  repairCount?: number;
}

export interface Part {
  id: string;
  sku: string;
  name: string;
  category: string;
  compatibleModels: string[];
  costPrice: number;
  sellingPrice: number;
  quantityInStock: number;
  minThreshold: number; // Low stock alert threshold
  location?: string; // Bin / shelf location e.g. Shelf A-3
  supplier?: string;
}

export interface RepairTimelineEvent {
  id: string;
  status: RepairStatus;
  title: string;
  description: string;
  timestamp: string;
  userName: string;
  userRole: Role;
}

export interface Diagnosis {
  id: string;
  repairId: string;
  technicianId: string;
  technicianName: string;
  reportedIssue: string;
  diagnosisNotes: string;
  findings: string[];
  batteryHealthPercent?: number;
  liquidDamage: boolean;
  priorRepairAttempt: boolean;
  rootCause: string;
  recommendedAction: string;
  createdAt: string;
}

export type EstimateItemType = 'PART' | 'LABOR' | 'DIAGNOSIS_FEE' | 'OTHER';

export interface EstimateItem {
  id: string;
  type: EstimateItemType;
  description: string;
  partId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type EstimateStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface Estimate {
  id: string;
  estimateNumber: string; // e.g. EST-2026-0042
  repairId: string;
  items: EstimateItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: EstimateStatus;
  validUntil: string;
  rejectionReason?: string;
  createdAt: string;
  notes?: string;
}

export interface PartUsage {
  id: string;
  repairId: string;
  partId: string;
  partName: string;
  partSku: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  usedAt: string;
  usedByTechnicianName: string;
}

export interface QCCheckItem {
  key: string;
  label: string;
  status: 'PASS' | 'FAIL' | 'NA';
  notes?: string;
}

export interface QCInspection {
  id: string;
  repairId: string;
  inspectorName: string;
  passed: boolean;
  checklist: QCCheckItem[];
  notes?: string;
  inspectedAt: string;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'BKASH' | 'BANK_TRANSFER' | 'MOBILE_PAY';

export interface Payment {
  id: string;
  paymentNumber: string; // e.g. PAY-2026-0012
  invoiceId: string;
  repairId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  receivedBy: string;
  createdAt: string;
}

export type InvoiceStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-00089
  repairId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  estimateId?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
  payments: Payment[];
}

export interface Warranty {
  id: string;
  warrantyCode: string; // e.g. WAR-2026-0099
  repairId: string;
  invoiceId: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  imeiOrSerial: string;
  coverageDetails: string;
  durationMonths: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'VOIDED';
  terms: string;
  claimsCount: number;
}

export interface Repair {
  id: string;
  ticketNumber: string; // e.g. REP-2026-000123
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  productId: string;
  deviceBrand: string;
  deviceModel: string;
  deviceColor?: string;
  imeiOrSerial: string;
  passcodePattern?: string; // Optional security passcode for testing
  physicalCondition: 'LIKE_NEW' | 'LIGHT_SCRATCHES' | 'HEAVILY_SCRATCHED' | 'DENTED' | 'CRACKED_BACK' | 'OTHER';
  accessoriesReceived?: string[]; // Charger, SIM tray, Case, etc.
  problemDescription: string;
  status: RepairStatus;
  priority: Priority;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  expectedCompletionDate: string;
  receivedAt: string;
  completedAt?: string;
  estimatedCost?: number;
  finalCost?: number;
  timeline: RepairTimelineEvent[];
  diagnosis?: Diagnosis;
  estimate?: Estimate;
  partsUsed: PartUsage[];
  qcInspection?: QCInspection;
  invoiceId?: string;
  warrantyId?: string;
  internalNotes?: string;
}

export interface ShopSettings {
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
  taxNumber: string;
  currencyCode: string; // BDT, USD, EUR, etc.
  currencySymbol: string; // ৳, $, €, etc.
  invoicePrefix: string;
  repairPrefix: string;
  defaultTaxRatePercent: number;
  defaultWarrantyDurationMonths: number;
  termsAndConditions: string;
}
