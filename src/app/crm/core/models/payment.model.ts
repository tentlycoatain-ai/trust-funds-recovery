// ─── Payment Model ──────────────────────────────────────────────────────────
export type PaymentStatus = 'completed' | 'pending' | 'processing' | 'failed' | 'refunded';
export type PaymentMethod = 'wire_transfer' | 'ach' | 'check' | 'direct_deposit';
export type PaymentType = 'recovery_payout' | 'contingency_fee' | 'court_disbursement' | 'retainer';

export interface Payment {
  id: string;
  referenceNumber: string;    // e.g. "PAY-4091"
  caseId: string;
  caseNumber: string;
  customerId: string;
  customerName: string;
  amount: number;             // Total gross recovered or disbursed
  feeAmount: number;          // Company contingency fee
  clientPayoutAmount: number; // Net amount received by customer
  type: PaymentType;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;               // ISO string
  transactionReference?: string;
  notes?: string;
}
