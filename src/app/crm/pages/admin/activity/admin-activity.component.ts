import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivityService } from '../../../core/services/activity.service';
import { ActivityEvent, ActivityType } from '../../../core/models/activity.model';

@Component({
  selector: 'crm-admin-activity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Activity Feed</h1>
          <p class="page-subtitle">Real-time enterprise event stream and operational log</p>
        </div>
        <div class="activity-counter">
          <span class="pulse-dot"></span>
          <span>Live Stream ({{ filteredActivities().length }} events)</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-row">
        <div class="search-box">
          <img class="real-icon real-icon-inline" src="/assets/icons/chart-report.png" alt="" aria-hidden="true" />
          <input type="text" [(ngModel)]="searchQuery" placeholder="Filter by action, user or details..." class="search-input" />
        </div>

        <div class="chip-group">
          @for (type of activityTypes; track type) {
            <button 
              type="button" 
              class="type-chip" 
              [class.active]="selectedType() === type"
              (click)="setType(type)"
            >
              {{ type | titlecase }}
            </button>
          }
        </div>
      </div>

      <!-- Timeline Feed -->
      <div class="timeline-container">
        @for (item of filteredActivities(); track item.id) {
          <div class="timeline-card">
            <div class="timeline-badge" [class]="'type-' + item.type">
              @switch (item.type) {
                @case ('case') {
                  <img class="real-icon real-icon-inline" src="/assets/icons/chart-report.png" alt="" aria-hidden="true" />
                }
                @case ('customer') {
                  <img class="real-icon real-icon-inline" src="/assets/icons/chart-report.png" alt="" aria-hidden="true" />
                }
                @case ('payment') {
                  <img class="real-icon real-icon-inline" src="/assets/icons/phone-handset.png" alt="" aria-hidden="true" />
                }
                @case ('call') {
                  <img class="real-icon real-icon-inline" src="/assets/icons/phone-handset.png" alt="" aria-hidden="true" />
                }
                @case ('task') {
                  <img class="real-icon real-icon-inline" src="/assets/icons/chart-report.png" alt="" aria-hidden="true" />
                }
                @default {
                  <img class="real-icon real-icon-inline" src="/assets/icons/chart-report.png" alt="" aria-hidden="true" />
                }
              }
            </div>

            <div class="timeline-body">
              <div class="timeline-header">
                <div class="user-meta">
                  <span class="user-name">{{ item.userName }}</span>
                  <span class="user-role-tag" [class.admin-tag]="item.userRole === 'admin'">{{ item.userRole | uppercase }}</span>
                  <span class="action-text">{{ item.action }}</span>
                </div>
                <span class="timestamp">{{ formatTimestamp(item.timestamp) }}</span>
              </div>

              <div class="details-text">{{ item.details }}</div>

              @if (item.targetName) {
                <div class="target-chip">
                  <span class="target-label">Target:</span>
                  <span class="target-val">{{ item.targetName }}</span>
                </div>
              }
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <img class="real-icon real-icon-inline" src="/assets/icons/chart-report.png" alt="" aria-hidden="true" />
            <p>No activity records matching your criteria</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; max-width: 1000px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 700; color: var(--crm-text-primary); margin: 0 0 4px; }
    .page-subtitle { font-size: 14px; color: var(--crm-text-secondary); margin: 0; }
    .activity-counter { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #16a34a; background: #f0fdf4; border: 1px solid #86efac; padding: 6px 12px; border-radius: 20px; }
    .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #16a34a; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(22,163,74,0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(22,163,74,0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(22,163,74,0); } }
    .filters-row { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }
    .search-box { display: flex; align-items: center; gap: 10px; background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 10px; padding: 10px 14px; }
    .search-input { border: none; background: transparent; outline: none; font-size: 14px; color: var(--crm-text-primary); width: 100%; }
    .chip-group { display: flex; gap: 8px; flex-wrap: wrap; }
    .type-chip { border: 1px solid var(--crm-border); background: var(--crm-surface); color: var(--crm-text-secondary); font-size: 12px; font-weight: 500; padding: 6px 14px; border-radius: 20px; cursor: pointer; transition: all 0.2s; }
    .type-chip:hover { border-color: var(--crm-accent); color: var(--crm-accent); }
    .type-chip.active { background: var(--crm-accent); color: #fff; border-color: var(--crm-accent); }
    .timeline-container { display: flex; flex-direction: column; gap: 14px; }
    .timeline-card { display: flex; gap: 16px; background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 12px; padding: 18px; transition: border-color 0.2s; }
    .timeline-card:hover { border-color: rgba(59,130,246,0.4); }
    .timeline-badge { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .type-case { background: #eff6ff; color: #2563eb; }
    .type-customer { background: #f0fdf4; color: #16a34a; }
    .type-payment { background: #fdf2f8; color: #db2777; }
    .type-call { background: #fff7ed; color: #ea580c; }
    .type-task { background: #f5f3ff; color: #7c3aed; }
    .timeline-body { flex: 1; min-width: 0; }
    .timeline-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; gap: 12px; flex-wrap: wrap; }
    .user-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .user-name { font-size: 14px; font-weight: 600; color: var(--crm-text-primary); }
    .user-role-tag { font-size: 10px; font-weight: 700; background: var(--crm-surface-2); color: var(--crm-text-secondary); padding: 2px 6px; border-radius: 4px; }
    .user-role-tag.admin-tag { background: #eff6ff; color: #2563eb; }
    .action-text { font-size: 13px; color: var(--crm-text-secondary); font-weight: 500; }
    .timestamp { font-size: 12px; color: var(--crm-text-muted); }
    .details-text { font-size: 13px; color: var(--crm-text-primary); line-height: 1.5; margin-bottom: 8px; }
    .target-chip { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; background: var(--crm-surface-2); padding: 3px 8px; border-radius: 6px; border: 1px solid var(--crm-border); }
    .target-label { color: var(--crm-text-muted); }
    .target-val { color: var(--crm-text-primary); font-weight: 600; }
    .empty-state { text-align: center; padding: 60px 20px; color: var(--crm-text-muted); }
    .empty-state svg { opacity: 0.4; margin-bottom: 12px; }
  `]
})
export class AdminActivityComponent {
  private activityService = inject(ActivityService);
  private rawActivities = toSignal(this.activityService.activities$, { initialValue: [] });

  searchQuery = '';
  selectedType = signal<string>('all');

  activityTypes = ['all', 'case', 'customer', 'payment', 'call', 'task', 'document', 'lead'];

  filteredActivities = computed(() => {
    const list = this.rawActivities();
    const type = this.selectedType();
    const query = this.searchQuery.toLowerCase().trim();

    return list.filter(item => {
      const matchesType = type === 'all' || item.type === type;
      const matchesQuery = !query || 
        item.action.toLowerCase().includes(query) || 
        item.userName.toLowerCase().includes(query) || 
        item.details.toLowerCase().includes(query) ||
        (item.targetName && item.targetName.toLowerCase().includes(query));

      return matchesType && matchesQuery;
    });
  });

  setType(type: string) {
    this.selectedType.set(type);
  }

  formatTimestamp(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
