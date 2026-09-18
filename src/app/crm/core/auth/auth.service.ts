import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthUser, LoginCredentials, UserRole } from './models/user.model';

const STORAGE_KEY = 'tfr_crm_auth_user';

const DEFAULT_ADMIN: AuthUser = {
  id: 'usr-admin-1',
  name: 'Eleanor Vance',
  email: 'admin@trustfundsrecovery.com',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
};

const DEFAULT_AGENT: AuthUser = {
  id: 'usr-agent-1',
  name: 'Marcus Vance',
  email: 'marcus.vance@trustfundsrecovery.com',
  role: 'agent',
  agentId: 'agent-1',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());
  readonly currentUser$: Observable<AuthUser | null> = this.userSubject.asObservable();
  
  // Signal representation
  readonly currentUser = signal<AuthUser | null>(this.userSubject.value);
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');
  readonly isAgent = computed(() => this.currentUser()?.role === 'agent');

  constructor(private router: Router) {}

  private loadUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    // Default demo session: Admin enabled for seamless exploration
    return DEFAULT_ADMIN;
  }

  login(credentials: LoginCredentials, role: UserRole = 'admin'): boolean {
    const user: AuthUser = role === 'admin'
      ? { ...DEFAULT_ADMIN, email: credentials.email || DEFAULT_ADMIN.email }
      : { ...DEFAULT_AGENT, email: credentials.email || DEFAULT_AGENT.email };

    this.setCurrentUser(user);
    if (role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/agent/dashboard']);
    }
    return true;
  }

  quickLoginAs(role: UserRole): void {
    const user = role === 'admin' ? DEFAULT_ADMIN : DEFAULT_AGENT;
    this.setCurrentUser(user);
    if (role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/agent/dashboard']);
    }
  }

  logout(): void {
    const currentRole = this.currentUser()?.role;
    this.setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
    if (currentRole === 'agent') {
      this.router.navigate(['/agent/login']);
    } else {
      this.router.navigate(['/admin/login']);
    }
  }

  switchRole(targetRole: UserRole): void {
    const targetUser = targetRole === 'admin' ? DEFAULT_ADMIN : DEFAULT_AGENT;
    this.setCurrentUser(targetUser);
    if (targetRole === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/agent/dashboard']);
    }
  }

  private setCurrentUser(user: AuthUser | null): void {
    this.userSubject.next(user);
    this.currentUser.set(user);
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
