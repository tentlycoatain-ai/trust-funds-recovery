// ─── Lead Model ─────────────────────────────────────────────────────────────
export type LeadStage =
  | 'new'
  | 'contacted'
  | 'interested'
  | 'contract_sent'
  | 'contract_signed'
  | 'converted'
  | 'unqualified'
  | 'lost';

export type LeadStatus = 'active' | 'nurturing' | 'closed' | 'bad_lead';

export interface Lead {
  id: string;
  leadNumber: string;         // e.g. "LEAD-3012"
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;              // Full phone (Admin)
  maskedPhone: string;        // Masked phone (Agent)
  propertyAddress?: string;
  state: string;
  county?: string;
  estimatedOverage: number;
  surplusType: string;        // e.g. "Tax Deed Surplus", "Mortgage Foreclosure", "Unclaimed Funds"
  stage: LeadStage;
  status: LeadStatus;
  score: number;              // 1-100 lead score
  source: string;             // e.g. "County Records", "Website Form", "Direct Mail", "Skip Trace"
  assignedAgentId?: string;
  assignedAgentName?: string;
  dateAdded: string;          // ISO string
  lastContactDate?: string;
  notes?: string;
  convertedCustomerId?: string;
  customFields?: Record<string, string | number | boolean>;
}

export type LeadSummary = Pick<Lead,
  'id' | 'leadNumber' | 'fullName' | 'maskedPhone' | 'estimatedOverage' | 'surplusType' | 'stage' | 'status' | 'assignedAgentName' | 'dateAdded'
>;
