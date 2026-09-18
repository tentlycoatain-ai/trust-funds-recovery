// ─── Communication Model ───────────────────────────────────────────────────
export type CommunicationType = 'email' | 'sms' | 'note' | 'mail';
export type CommunicationStatus = 'sent' | 'received' | 'draft' | 'scheduled';

export interface Communication {
  id: string;
  type: CommunicationType;
  customerId?: string;
  customerName?: string;
  leadId?: string;
  leadName?: string;
  agentId: string;
  agentName: string;
  subject?: string;
  content: string;
  status: CommunicationStatus;
  timestamp: string;          // ISO string
}
