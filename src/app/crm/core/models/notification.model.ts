// ─── Notification Model ───────────────────────────────────────────────────
export type NotificationType =
  | 'case_update'
  | 'task_due'
  | 'payment_received'
  | 'lead_assigned'
  | 'system'
  | 'call_reminder';

export interface CrmNotification {
  id: string;
  userId: string;             // User id or 'all' or 'admin'
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;          // ISO string
  link?: string;              // Target router link e.g. '/admin/cases/TRF-1024'
}
