import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../../core/services/notification.service';
import { CrmNotification } from '../../../core/models/notification.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'crm-agent-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Agent Notifications & Alerts</h1>
          <p class="page-subtitle">Assigned claimant updates, court calendar reminders, and verified document notifications</p>
        </div>
        <div class="header-actions">
          <button class="btn-ghost" (click)="markAllRead()" [disabled]="unreadCount() === 0">
            <img class="real-icon real-icon-inline" src="/assets/icons/calendar-desk.png" alt="" aria-hidden="true" />
            Mark All Read
          </button>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="stats-row">
        <div class="stat-pill">
          <span class="val">{{ notifications().length }}</span>
          <span class="lbl">Total Notifications</span>
        </div>
        <div class="stat-pill">
          <span class="val highlight">{{ unreadCount() }}</span>
          <span class="lbl">Unread Alerts</span>
        </div>
      </div>

      <!-- Category Filter Tabs -->
      <div class="tabs-bar">
        <button [class.active]="filterType() === 'all'" (click)="filterType.set('all')">All</button>
        <button [class.active]="filterType() === 'unread'" (click)="filterType.set('unread')">Unread Only</button>
        <button [class.active]="filterType() === 'case_update'" (click)="filterType.set('case_update')">Case Updates</button>
        <button [class.active]="filterType() === 'task_due'" (click)="filterType.set('task_due')">Tasks</button>
      </div>

      <!-- List -->
      <div class="notif-list">
        @for (item of filteredNotifications(); track item.id) {
          <div class="notif-item" [class.is-unread]="!item.read" (click)="toggleRead(item)">
            <div class="notif-icon" [class]="'icon-' + item.type">
              @switch (item.type) {
                @case ('case_update') {
                  <img class="real-icon real-icon-inline" src="/assets/icons/calendar-desk.png" alt="" aria-hidden="true" />
                }
                @case ('task_due') {
                  <img class="real-icon real-icon-inline" src="/assets/icons/calendar-desk.png" alt="" aria-hidden="true" />
                }
                @default {
                  <img class="real-icon real-icon-inline" src="/assets/icons/coin-stack.png" alt="" aria-hidden="true" />
                }
              }
            </div>

            <div class="notif-content">
              <div class="notif-top">
                <span class="notif-title">{{ item.title }}</span>
                <span class="notif-time">{{ formatTime(item.timestamp) }}</span>
              </div>
              <p class="notif-msg">{{ item.message }}</p>
              <span class="entity-tag">{{ item.type.replace('_', ' ') | titlecase }}</span>
            </div>

            @if (!item.read) {
              <div class="unread-dot" title="Unread"></div>
            }
          </div>
        } @empty {
          <div class="empty-state">
            <img class="real-icon real-icon-inline" src="/assets/icons/coin-stack.png" alt="" aria-hidden="true" />
            <p>No notifications matching this view.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; max-width: 850px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 700; color: var(--crm-text-primary); margin: 0 0 4px; }
    .page-subtitle { font-size: 14px; color: var(--crm-text-secondary); margin: 0; }
    .btn-ghost { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 8px; font-size: 12px; font-weight: 600; color: var(--crm-text-secondary); cursor: pointer; transition: all 0.2s; }
    .btn-ghost:hover { background: var(--crm-surface-2); color: var(--crm-text-primary); }
    .btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }
    .stats-row { display: flex; gap: 14px; margin-bottom: 20px; }
    .stat-pill { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 12px; padding: 12px 18px; display: flex; align-items: center; gap: 10px; }
    .stat-pill .val { font-size: 18px; font-weight: 700; color: var(--crm-text-primary); }
    .stat-pill .val.highlight { color: var(--crm-accent); }
    .stat-pill .lbl { font-size: 12px; color: var(--crm-text-muted); font-weight: 500; }
    .tabs-bar { display: flex; gap: 6px; margin-bottom: 18px; flex-wrap: wrap; }
    .tabs-bar button { border: 1px solid var(--crm-border); background: var(--crm-surface); color: var(--crm-text-secondary); font-size: 12px; font-weight: 500; padding: 6px 14px; border-radius: 20px; cursor: pointer; transition: all 0.2s; }
    .tabs-bar button.active { background: var(--crm-accent); color: white; border-color: var(--crm-accent); }
    .notif-list { display: flex; flex-direction: column; gap: 10px; }
    .notif-item { display: flex; align-items: flex-start; gap: 14px; background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.15s; }
    .notif-item:hover { background: var(--crm-surface-2); }
    .notif-item.is-unread { border-color: rgba(59,130,246,0.3); background: rgba(59,130,246,0.02); }
    .notif-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--crm-surface-2); color: var(--crm-text-secondary); }
    .icon-case_update { background: #eff6ff; color: #2563eb; }
    .icon-task_due { background: #fffbeb; color: #d97706; }
    .notif-content { flex: 1; min-width: 0; }
    .notif-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .notif-title { font-size: 14px; font-weight: 600; color: var(--crm-text-primary); }
    .notif-time { font-size: 11px; color: var(--crm-text-muted); }
    .notif-msg { font-size: 13px; color: var(--crm-text-secondary); margin: 0 0 8px; line-height: 1.4; }
    .entity-tag { font-size: 10px; font-weight: 600; background: var(--crm-surface-2); color: var(--crm-text-muted); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--crm-border); }
    .unread-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--crm-accent); flex-shrink: 0; margin-top: 4px; }
    .empty-state { text-align: center; padding: 60px 20px; color: var(--crm-text-muted); }
    .empty-state svg { opacity: 0.4; margin-bottom: 12px; }
  `]
})
export class AgentNotificationsComponent {
  private notifService = inject(NotificationService);
  private toastService = inject(ToastService);

  notifications = toSignal(this.notifService.notifications$, { initialValue: [] });
  filterType = signal<string>('all');

  unreadCount = computed(() => this.notifications().filter((n: CrmNotification) => !n.read).length);

  filteredNotifications = computed(() => {
    const filter = this.filterType();
    const list = this.notifications();
    if (filter === 'all') return list;
    if (filter === 'unread') return list.filter((n: CrmNotification) => !n.read);
    return list.filter((n: CrmNotification) => n.type === filter);
  });

  toggleRead(item: CrmNotification) {
    if (!item.read) {
      this.notifService.markAsRead(item.id);
    }
  }

  markAllRead() {
    this.notifService.markAllAsRead();
    this.toastService.show('All notifications marked as read', 'info');
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hrs = Math.floor(diff / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }
}
