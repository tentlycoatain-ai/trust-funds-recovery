// ─── User / Auth Models ───────────────────────────────────────────────────────
export type UserRole = 'admin' | 'agent';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  agentId?: string; // set when role === 'agent'
}

export interface LoginCredentials {
  email: string;
  password: string;
}
