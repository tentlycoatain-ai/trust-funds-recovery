// ─── Customer Model ─────────────────────────────────────────────────────────
export type CustomerStatus = 'active' | 'pending' | 'resolved' | 'archived' | 'inactive';

export interface CustomerAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Customer {
  id: string;
  customerNumber: string; // e.g. "CUST-1042"
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;          // Full real phone number (Admin only)
  maskedPhone: string;    // Masked phone for Agent view: +1 (***) ***-4829
  address?: CustomerAddress;
  status: CustomerStatus;
  assignedAgentId: string;
  assignedAgentName?: string;
  totalClaimAmount: number;
  totalRecoveredAmount: number;
  claimType: string;      // e.g. "Foreclosure Surplus", "Tax Sale Overage", "Unclaimed Escrow"
  dateAdded: string;      // ISO string
  lastContactedDate?: string;
  notes?: string;
  activeCasesCount: number;
  totalCasesCount: number;
  tags?: string[];
}

export type CustomerSummary = Pick<Customer,
  'id' | 'customerNumber' | 'fullName' | 'email' | 'maskedPhone' | 'status' | 'assignedAgentName' | 'totalClaimAmount' | 'claimType'
>;
