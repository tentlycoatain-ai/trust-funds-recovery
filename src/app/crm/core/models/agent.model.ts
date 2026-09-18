// ─── Agent Model ──────────────────────────────────────────────────────────────
export type AgentStatus = 'active' | 'inactive' | 'on_leave';

export interface Agent {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;        // e.g. "Senior Recovery Specialist"
  department: string;
  status: AgentStatus;
  avatar?: string;
  dateJoined: string;  // ISO date
  lastActive: string;  // ISO date
  // Work stats
  assignedCustomers: number;
  activeCases: number;
  completedCases: number;
  pendingTasks: number;
  completedTasks: number;
  callsMade: number;
  callsConnected: number;
  callsMissed: number;
}

export type AgentSummary = Pick<Agent,
  'id' | 'firstName' | 'lastName' | 'email' | 'avatar' | 'status' | 'role'
>;
