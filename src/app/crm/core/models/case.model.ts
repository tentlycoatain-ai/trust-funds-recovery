// ─── Case Model ─────────────────────────────────────────────────────────────
export type CaseStatus =
  | 'new'
  | 'under_review'
  | 'documents_required'
  | 'assessment'
  | 'in_progress'
  | 'awaiting_client'
  | 'recovery_processing'
  | 'completed'
  | 'on_hold'
  | 'closed';

export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface RecoveryCase {
  id: string;
  caseNumber: string;         // e.g. "TRF-5012"
  customerId: string;
  customerName: string;
  title: string;
  claimType: string;          // e.g. "Mortgage Foreclosure Overage"
  status: CaseStatus;
  priority: CasePriority;
  claimAmount: number;
  expectedFee: number;        // Contingency fee amount
  feePercentage: number;      // e.g. 25 (%)
  recoveredAmount: number;    // Amount recovered so far
  assignedAgentId: string;
  assignedAgentName: string;
  filingJurisdiction?: string; // e.g. "Orange County Superior Court, CA"
  caseRefNumber?: string;      // Official court / county case docket number
  filingDate?: string;
  hearingDate?: string;
  dateCreated: string;        // ISO string
  lastUpdated: string;        // ISO string
  description?: string;
  notes?: string;
}

export type CaseSummary = Pick<RecoveryCase,
  'id' | 'caseNumber' | 'customerName' | 'title' | 'status' | 'priority' | 'claimAmount' | 'assignedAgentName' | 'lastUpdated'
>;
