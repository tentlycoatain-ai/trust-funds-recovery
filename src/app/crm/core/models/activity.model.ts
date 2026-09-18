// ─── Activity / Audit Event Model ───────────────────────────────────────────
export type ActivityType =
  | 'lead'
  | 'customer'
  | 'case'
  | 'task'
  | 'call'
  | 'payment'
  | 'document'
  | 'auth'
  | 'system';

export interface ActivityEvent {
  id: string;
  userId: string;
  userName: string;
  userRole: 'admin' | 'agent';
  action: string;             // e.g. "Updated case status to In Progress"
  type: ActivityType;
  details: string;
  targetId?: string;
  targetName?: string;
  timestamp: string;          // ISO string
}
