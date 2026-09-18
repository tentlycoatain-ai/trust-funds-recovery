// ─── Task Model ─────────────────────────────────────────────────────────────
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskType = 'call' | 'document_review' | 'court_filing' | 'follow_up' | 'intake' | 'general';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assignedAgentId: string;
  assignedAgentName: string;
  dueDate: string;            // ISO string
  completedDate?: string;     // ISO string
  relatedCustomerId?: string;
  relatedCustomerName?: string;
  relatedCaseId?: string;
  relatedCaseNumber?: string;
  dateCreated: string;        // ISO string
}
