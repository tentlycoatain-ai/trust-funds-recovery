import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../../core/services/notification.service';
import { CrmNotification } from '../../../core/models';

@Component({
  selector: 'crm-admin-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Notification Center</h1>
          <p class="page-subtitle">System alerts, updates and activity notifications</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-ghost" (click)="markAllRead()" [disabled]="unreadCount() === 0">
            <img class="real-icon real-icon-inline" src="/assets/icons/calendar-desk.png" alt="" aria-hidden="true" />
            Mark All Read
          </button>
          <button class="btn btn-ghost danger" (click)="clearAll()">
            <img class="real-icon real-icon-inline" src="/assets/icons/coin-stack.png" alt="" aria-hidden="true" />
            Clear All
          </button>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="notif-stats">
        <div class="notif-stat">
          <span class="notif-stat-num">{{ notifications().length }}</span>
          <span class="notif-stat-label">Total</span>
        </div>
        <div class="notif-stat">
          <span class="notif-stat-num unread">{{ unreadCount() }}</span>
          <span class="notif-stat-label">Unread</span>
        </div>
        <div class="notif-stat">
          <span class="notif-stat-num">{{ readCount() }}</span>
          <span class="notif-stat-label">Read</span>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="notif-tabs">
        <button class="notif-tab" [class.active]="activeFilter() === 'all'" (click)="setFilter('all')">All</button>
        <button class="notif-tab" [class.active]="activeFilter() === 'unread'" (click)="setFilter('unread')">
          Unread
          @if (unreadCount() > 0) { <span class="tab-badge">{{ unreadCount() }}</span> }
        </button>
        <button class="notif-tab" [class.active]="activeFilter() === 'case_update'" (click)="setFilter('case_update')">Case Updates</button>
        <button class="notif-tab" [class.active]="activeFilter() === 'task_due'" (click)="setFilter('task_due')">Tasks</button>
        <button class="notif-tab" [class.active]="activeFilter() === 'payment_received'" (click)="setFilter('payment_received')">Payments</button>
      </div>

      <!-- Notification List -->
      <div class="notif-list">
        @for (notif of filteredNotifications(); track notif.id) {
          <div class="notif-item" [class.unread]="!notif.read" (click)="markRead(notif)">
            <div class="notif-icon" [class]="'notif-icon--' + notif.type">
              @switch (notif.type) {
                @case ('case_update') {
                  <img class="real-icon real-icon-inline" src="/assets/icons/calendar-desk.png" alt="" aria-hidden="true" />
                }
                @case ('payment_received') {
                  <img class="real-icon real-icon-inline" src="/assets/icons/calendar-desk.png" alt="" aria-hidden="true" />
                }
                @case ('task_due') {
                  <img class="real-icon real-icon-inline" src="/assets/icons/calendar-desk.png" alt="" aria-hidden="true" />
                }
                @default {
                  <img class="real-icon real-icon-inline" src="/assets/icons/envelope-letter.png" alt="" aria-hidden="true" />
                }
              }
            </div>
            <div class="notif-body">
              <div class="notif-title">{{ notif.title }}</div>
              <div class="notif-message">{{ notif.message }}</div>
              <div class="notif-meta">
                <span class="notif-time">{{ formatTime(notif.timestamp) }}</span>
                <span class="notif-entity">{{ notif.type.replace('_', ' ') | titlecase }}</span>
              </div>
            </div>
            @if (!notif.read) {
              <div class="notif-unread-dot"></div>
            }
          </div>
        }

        @empty {
          <div class="notif-empty">
            <img class="real-icon real-icon-inline" src="/assets/icons/coin-stack.png" alt="" aria-hidden="true" />
            <p>No notifications</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; max-width: 800px; margin: 0 auto; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .page-title { font-size: 24px; font-weight: 700; color: var(--crm-text-primary); margin: 0 0 4px 0; }
    .page-subtitle { font-size: 14px; color: var(--crm-text-secondary); margin: 0; }
    .page-header-actions { display: flex; gap: 8px; }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; }
    .btn-ghost { background: transparent; border-color: var(--crm-border); color: var(--crm-text-secondary); }
    .btn-ghost:hover { background: var(--crm-surface-2); color: var(--crm-text-primary); }
    .btn-ghost.danger:hover { background: #fef2f2; color: #dc2626; border-color: #fca5a5; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .notif-stats { display: flex; gap: 24px; margin-bottom: 24px; padding: 16px 24px; background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 12px; }
    .notif-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .notif-stat-num { font-size: 24px; font-weight: 700; color: var(--crm-text-primary); }
    .notif-stat-num.unread { color: var(--crm-accent); }
    .notif-stat-label { font-size: 12px; color: var(--crm-text-muted); }
    .notif-tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid var(--crm-border); padding-bottom: 0; flex-wrap: wrap; }
    .notif-tab { padding: 8px 16px; border: none; background: transparent; font-size: 13px; font-weight: 500; color: var(--crm-text-secondary); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
    .notif-tab.active { color: var(--crm-accent); border-bottom-color: var(--crm-accent); }
    .notif-tab:hover { color: var(--crm-text-primary); }
    .tab-badge { background: var(--crm-accent); color: white; font-size: 11px; font-weight: 600; padding: 1px 6px; border-radius: 10px; }
    .notif-list { display: flex; flex-direction: column; gap: 8px; }
    .notif-item { display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 10px; cursor: pointer; transition: all 0.15s; position: relative; }
    .notif-item:hover { background: var(--crm-surface-2); }
    .notif-item.unread { background: rgba(59,130,246,0.04); border-color: rgba(59,130,246,0.2); }
    .notif-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--crm-surface-2); color: var(--crm-text-secondary); }
    .notif-icon--case_update { background: #eff6ff; color: #2563eb; }
    .notif-icon--payment_received { background: #f0fdf4; color: #16a34a; }
    .notif-icon--task_due { background: #fffbeb; color: #d97706; }
    .notif-body { flex: 1; min-width: 0; }
    .notif-title { font-size: 14px; font-weight: 600; color: var(--crm-text-primary); margin-bottom: 4px; }
    .notif-message { font-size: 13px; color: var(--crm-text-secondary); line-height: 1.5; margin-bottom: 8px; }
    .notif-meta { display: flex; align-items: center; gap: 12px; }
    .notif-time { font-size: 12px; color: var(--crm-text-muted); }
    .notif-entity { font-size: 11px; background: var(--crm-surface-2); padding: 2px 8px; border-radius: 10px; color: var(--crm-text-secondary); }
    .notif-unread-dot { width: 8px; height: 8px; background: var(--crm-accent); border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
    .notif-empty { text-align: center; padding: 64px 32px; color: var(--crm-text-muted); }
    .notif-empty svg { margin-bottom: 16px; opacity: 0.4; }
    .notif-empty p { font-size: 15px; }
  `]
})
export class AdminNotificationsComponent {
  private notifService = inject(NotificationService);

  notifications = toSignal(this.notifService.notifications$, { initialValue: [] });
  activeFilter = signal<string>('all');

  unreadCount = computed(() => this.notifications().filter((n: CrmNotification) => !n.read).length);
  readCount = computed(() => this.notifications().filter((n: CrmNotification) => n.read).length);

  filteredNotifications = computed(() => {
    const filter = this.activeFilter();
    const all = this.notifications();
    if (filter === 'all') return all;
    if (filter === 'unread') return all.filter((n: CrmNotification) => !n.read);
    return all.filter((n: CrmNotification) => n.type === filter);
  });

  setFilter(filter: string) {
    this.activeFilter.set(filter);
  }

  markRead(notif: CrmNotification) {
    if (!notif.read) {
      this.notifService.markAsRead(notif.id);
    }
  }

  markAllRead() {
    this.notifService.markAllAsRead();
  }

  clearAll() {
    this.notifService.clearAll();
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }
}
