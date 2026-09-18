import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { DialerModalComponent } from '../../shared/components/dialer-modal/dialer-modal.component';

@Component({
  selector: 'crm-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ToastComponent,
    DialerModalComponent
  ],
  template: `
    <div class="crm-shell" [class.sidebar-collapsed]="isSidebarCollapsed()">
      <!-- Sidebar -->
      <aside class="crm-sidebar">
        <!-- Sidebar Brand -->
        <div class="sidebar-header">
          <div class="brand-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          @if (!isSidebarCollapsed()) {
            <div class="brand-text">
              <span class="brand-title">Trust Recovery</span>
              <span class="brand-sub">Admin Console</span>
            </div>
          }
          <button class="collapse-toggle" (click)="toggleSidebar()" title="Toggle sidebar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="sidebar-nav">
          <div class="nav-group-label" *ngIf="!isSidebarCollapsed()">Core Recovery</div>
          
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span class="nav-label" *ngIf="!isSidebarCollapsed()">Dashboard</span>
          </a>

          <a routerLink="/admin/customers" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span class="nav-label" *ngIf="!isSidebarCollapsed()">Customers</span>
          </a>

          <a routerLink="/admin/leads" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
            <span class="nav-label" *ngIf="!isSidebarCollapsed()">Leads Pipeline</span>
          </a>

          <a routerLink="/admin/cases" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            <span class="nav-label" *ngIf="!isSidebarCollapsed()">Recovery Cases</span>
          </a>

          <a routerLink="/admin/tasks" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            <span class="nav-label" *ngIf="!isSidebarCollapsed()">Tasks</span>
          </a>

          <div class="nav-group-label" *ngIf="!isSidebarCollapsed()">Operations</div>

          <a routerLink="/admin/calls" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span class="nav-label" *ngIf="!isSidebarCollapsed()">Calls & Logs</span>
          </a>

          <a routerLink="/admin/agents" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span class="nav-label" *ngIf="!isSidebarCollapsed()">Agents & Staff</span>
          </a>

          <a routerLink="/admin/payments" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <span class="nav-label" *ngIf="!isSidebarCollapsed()">Payments & Fees</span>
          </a>

          <a routerLink="/admin/documents" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span class="nav-label" *ngIf="!isSidebarCollapsed()">Documents</span>
          </a>

          <div class="nav-group-label" *ngIf="!isSidebarCollapsed()">Analytics & System</div>

          <a routerLink="/admin/reports" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <span class="nav-label" *ngIf="!isSidebarCollapsed()">Reports</span>
          </a>

          <a routerLink="/admin/audit-logs" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span class="nav-label" *ngIf="!isSidebarCollapsed()">Audit Logs</span>
          </a>

          <a routerLink="/admin/settings" routerLinkActive="active" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span class="nav-label" *ngIf="!isSidebarCollapsed()">Settings</span>
          </a>
        </nav>

        <!-- Sidebar Footer -->
        <div class="sidebar-footer">
          <button type="button" class="btn-role-switch" (click)="switchToAgent()" title="Switch to Agent Portal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            <span *ngIf="!isSidebarCollapsed()">Agent Portal</span>
          </button>
        </div>
      </aside>

      <!-- Main Area -->
      <div class="crm-main-area">
        <!-- Topbar -->
        <header class="crm-topbar">
          <div class="topbar-left">
            <div class="quick-status">
              <span class="status-pulse"></span>
              <span class="status-label">System Active</span>
            </div>
          </div>

          <div class="topbar-right">
            <!-- Quick Telephony Dialer Launcher -->
            <button class="topbar-action-btn dialer-btn" (click)="openQuickDialer()" title="Open Dialer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>Dialer</span>
            </button>

            <!-- Notifications -->
            <div class="notif-wrapper">
              <button class="topbar-action-btn" (click)="toggleNotifDropdown()" title="Notifications">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                @if ((unreadNotifCount$ | async); as count) {
                  @if (count > 0) {
                    <span class="badge-count">{{ count }}</span>
                  }
                }
              </button>

              <!-- Notifications Dropdown -->
              @if (showNotifs()) {
                <div class="notif-dropdown">
                  <div class="notif-header">
                    <h4>Notifications</h4>
                    <button (click)="markAllRead()">Mark all read</button>
                  </div>
                  <div class="notif-list">
                    @for (item of notifications$ | async; track item.id) {
                      <div class="notif-row" [class.unread]="!item.read">
                        <strong>{{ item.title }}</strong>
                        <p>{{ item.message }}</p>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Public Website link -->
            <a routerLink="/" target="_blank" class="topbar-action-btn link-site" title="View Public Website">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              <span>Public Site</span>
            </a>

            <!-- User Menu -->
            <div class="user-profile-menu">
              <img [src]="currentUser()?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'" alt="Avatar" class="user-avatar" />
              <div class="user-info">
                <span class="user-name">{{ currentUser()?.name || 'Administrator' }}</span>
                <span class="user-role">Super Admin</span>
              </div>
              <button class="logout-btn" (click)="logout()" title="Logout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </div>
        </header>

        <!-- Routed Content -->
        <main class="crm-content">
          <router-outlet />
        </main>
      </div>

      <!-- Quick Dialer Modal -->
      <crm-dialer-modal
        [isOpen]="isDialerOpen()"
        recipientName="Direct Outbound Call"
        (closed)="isDialerOpen.set(false)"
      />

      <!-- Global Toast Container -->
      <crm-toast-container />
    </div>
  `,
  styles: [`
    .crm-shell {
      display: flex;
      min-height: 100vh;
      width: 100%;
      background-color: var(--crm-bg, #F8FAFC);
    }

    /* Sidebar */
    .crm-sidebar {
      width: var(--crm-sidebar-width, 260px);
      background-color: var(--crm-sidebar-bg, #0F172A);
      border-right: 1px solid var(--crm-sidebar-border, #334155);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: width 200ms ease;
      position: sticky;
      top: 0;
      height: 100vh;
      z-index: 100;
    }

    .sidebar-collapsed .crm-sidebar {
      width: var(--crm-sidebar-collapsed-width, 76px);
    }

    .sidebar-header {
      height: var(--crm-topbar-height, 64px);
      display: flex;
      align-items: center;
      padding: 0 1.25rem;
      gap: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .brand-badge {
      width: 38px;
      height: 38px;
      background: #2563EB;
      color: #FFFFFF;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      white-space: nowrap;
    }

    .brand-title {
      font-weight: 700;
      font-size: 0.95rem;
      color: #FFFFFF;
      letter-spacing: -0.01em;
    }

    .brand-sub {
      font-size: 0.75rem;
      color: #38BDF8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .collapse-toggle {
      margin-left: auto;
      background: none;
      border: none;
      color: #64748B;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover { color: #FFFFFF; background: rgba(255, 255, 255, 0.08); }
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.75rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .nav-group-label {
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748B;
      font-weight: 700;
      padding: 0.75rem 0.5rem 0.35rem 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.75rem;
      color: var(--crm-sidebar-text, #94A3B8);
      text-decoration: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 150ms ease;

      &:hover {
        color: #FFFFFF;
        background-color: rgba(255, 255, 255, 0.06);
      }

      &.active {
        color: #38BDF8;
        background-color: rgba(56, 189, 248, 0.12);
        font-weight: 600;
      }
    }

    .sidebar-footer {
      padding: 1rem 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .btn-role-switch {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.65rem;
      background: rgba(52, 211, 153, 0.1);
      color: #34D399;
      border: 1px solid rgba(52, 211, 153, 0.3);
      border-radius: 8px;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 150ms ease;

      &:hover {
        background: rgba(52, 211, 153, 0.2);
      }
    }

    /* Main Area */
    .crm-main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .crm-topbar {
      height: var(--crm-topbar-height, 64px);
      background-color: #FFFFFF;
      border-bottom: 1px solid var(--crm-border, #E2E8F0);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 90;
    }

    .quick-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #059669;
    }

    .status-pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #10B981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .topbar-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 0.85rem;
      border-radius: 6px;
      border: 1px solid #E2E8F0;
      background: #F8FAFC;
      color: #475569;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      position: relative;
      text-decoration: none;

      &:hover {
        background: #F1F5F9;
        color: #0F172A;
      }
    }

    .dialer-btn {
      color: #16A34A;
      background: #F0FDF4;
      border-color: #BBF7D0;
      &:hover { background: #DCFCE7; color: #15803D; }
    }

    .badge-count {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #EF4444;
      color: #FFFFFF;
      font-size: 0.6875rem;
      font-weight: 700;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notif-wrapper {
      position: relative;
    }

    .notif-dropdown {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      width: 320px;
      background: #FFFFFF;
      border-radius: 10px;
      border: 1px solid #E2E8F0;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      z-index: 200;
    }

    .notif-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      h4 { margin: 0; font-size: 0.95rem; color: #0F172A; }
      button { font-size: 0.75rem; color: #2563EB; cursor: pointer; border: none; background: none; }
    }

    .notif-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 250px;
      overflow-y: auto;
    }

    .notif-row {
      padding: 0.5rem;
      border-radius: 6px;
      font-size: 0.8125rem;
      background: #F8FAFC;
      border-left: 3px solid #CBD5E1;

      &.unread {
        background: #EFF6FF;
        border-left-color: #2563EB;
      }
      strong { display: block; color: #0F172A; margin-bottom: 2px; }
      p { margin: 0; color: #64748B; font-size: 0.75rem; }
    }

    .user-profile-menu {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding-left: 0.5rem;
      border-left: 1px solid #E2E8F0;
    }

    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #E2E8F0;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #0F172A;
    }

    .user-role {
      font-size: 0.6875rem;
      color: #64748B;
    }

    .logout-btn {
      background: none;
      border: none;
      color: #94A3B8;
      cursor: pointer;
      padding: 4px;
      margin-left: 4px;
      &:hover { color: #DC2626; }
    }

    .crm-content {
      flex: 1;
      padding: 1.75rem;
    }
  `]
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  private notifService = inject(NotificationService);
  private router = inject(Router);

  isSidebarCollapsed = signal<boolean>(false);
  showNotifs = signal<boolean>(false);
  isDialerOpen = signal<boolean>(false);

  readonly currentUser = this.authService.currentUser;
  readonly notifications$ = this.notifService.notifications$;
  readonly unreadNotifCount$ = this.notifService.unreadCount$;

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(v => !v);
  }

  toggleNotifDropdown(): void {
    this.showNotifs.update(v => !v);
  }

  markAllRead(): void {
    this.notifService.markAllAsRead();
  }

  openQuickDialer(): void {
    this.isDialerOpen.set(true);
  }

  switchToAgent(): void {
    this.authService.switchRole('agent');
  }

  logout(): void {
    this.authService.logout();
  }
}
