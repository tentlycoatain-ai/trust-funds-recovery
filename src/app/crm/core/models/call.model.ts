// ─── Call Model ─────────────────────────────────────────────────────────────
export type CallDirection = 'outbound' | 'inbound';
export type CallStatus = 'completed' | 'no_answer' | 'busy' | 'voicemail' | 'failed' | 'in_progress';
export type CallOutcome =
  | 'interested'
  | 'not_interested'
  | 'call_back_requested'
  | 'wrong_number'
  | 'do_not_call'
  | 'information_provided'
  | 'contract_requested'
  | 'other';

export interface Call {
  id: string;
  agentId: string;
  agentName: string;
  customerId?: string;
  customerName?: string;
  leadId?: string;
  leadName?: string;
  direction: CallDirection;
  realPhoneNumber: string;      // Admin only
  maskedPhoneNumber: string;    // Always displayed to Agent: +1 (***) ***-1234
  durationSeconds: number;      // e.g. 245
  status: CallStatus;
  outcome: CallOutcome;
  timestamp: string;            // ISO string
  notes?: string;
  recordingUrl?: string;        // Mock recording reference
  followUpDate?: string;
}
