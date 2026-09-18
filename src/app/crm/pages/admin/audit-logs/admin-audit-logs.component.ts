import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivityService } from '../../../core/services/activity.service';
import { ActivityEvent, ActivityType } from '../../../core/models/activity.model';

@Component({
  selector: 'crm-admin-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>System Audit & Compliance Log</h2>
          <p class="subtitle">Immutable chronological trail of security, case adjustments, and client data touchpoints.</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-card">
        <div class="tabs">
          <button [class.active]="filterType() === 'all'" (click)="filterType.set('all')">All Events</button>
          <button [class.active]="filterType() === 'call'" (click)="filterType.set('call')">Calls</button>
          <button [class.active]="filterType() === 'case'" (click)="filterType.set('case')">Cases</button>
          <button [class.active]="filterType() === 'lead'" (click)="filterType.set('lead')">Leads</button>
          <button [class.active]="filterType() === 'payment'" (click)="filterType.set('payment')">Payments</button>
        </div>
      </div>

      <!-- Logs Table -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User / Operator</th>
                <th>Role</th>
                <th>Category</th>
                <th>Action</th>
                <th>Detailed Description</th>
                <th>Target Reference</th>
              </tr>
            </thead>
            <tbody>
              @for (log of filteredLogs(); track log.id) {
                <tr>
                  <td class="time-col">{{ log.timestamp | date:'medium' }}</td>
                  <td><strong>{{ log.userName }}</strong></td>
                  <td>
                    <span class="role-badge" [ngClass]="log.userRole">{{ log.userRole | uppercase }}</span>
                  </td>
                  <td><span class="type-badge">{{ log.type }}</span></td>
                  <td class="action-text">{{ log.action }}</td>
                  <td class="details-col">{{ log.details }}</td>
                  <td class="ref-col">{{ log.targetName || '—' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header h2 { font-size: 1.65rem; color: #0F172A; margin: 0 0 0.25rem 0; }
    .subtitle { color: #64748B; font-size: 0.925rem; margin: 0; }
    .filter-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 0.75rem 1.25rem; display: flex; }
    .tabs { display: flex; gap: 0.4rem; button { padding: 0.4rem 0.85rem; border-radius: 6px; font-size: 0.8125rem; font-weight: 600; color: #64748B; cursor: pointer; &.active { background: #EFF6FF; color: #2563EB; } } }
    .table-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; th { padding: 0.75rem; color: #64748B; font-weight: 600; text-align: left; border-bottom: 1px solid #E2E8F0; } td { padding: 0.85rem; border-bottom: 1px solid #F1F5F9; color: #334155; } }
    .time-col { white-space: nowrap; color: #64748B; font-size: 0.8125rem; }
    .role-badge { font-size: 0.6875rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
    .role-badge.admin { background: #EFF6FF; color: #1D4ED8; }
    .role-badge.agent { background: #ECFDF5; color: #047857; }
    .type-badge { font-size: 0.75rem; background: #F1F5F9; color: #475569; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; font-weight: 600; }
    .action-text { font-weight: 600; color: #0F172A; }
    .details-col { max-width: 320px; font-size: 0.8125rem; color: #475569; }
    .ref-col { font-family: monospace; font-size: 0.8125rem; color: #2563EB; }
  `]
})
export class AdminAuditLogsComponent {
  private actService = inject(ActivityService);

  filterType = signal<string>('all');
  allLogs = signal<ActivityEvent[]>([]);

  constructor() {
    this.actService.activities$.subscribe(acts => {
      this.allLogs.set(acts);
    });
  }

  readonly filteredLogs = computed(() => {
    const filter = this.filterType();
    if (filter === 'all') return this.allLogs();
    return this.allLogs().filter(l => l.type === filter);
  });
}
