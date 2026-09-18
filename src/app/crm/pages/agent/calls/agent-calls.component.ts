import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { CallService } from '../../../core/services/call.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Call, CallStatus } from '../../../core/models/call.model';
import { PhoneDisplayComponent } from '../../../shared/components/phone-display/phone-display.component';
import { DialerModalComponent } from '../../../shared/components/dialer-modal/dialer-modal.component';

@Component({
  selector: 'crm-agent-calls',
  standalone: true,
  imports: [CommonModule, FormsModule, PhoneDisplayComponent, DialerModalComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">My Call History & Outcomes</h1>
          <p class="page-subtitle">Personal telephony logs, claimant follow-ups, and recorded call dispositions</p>
        </div>
        <button class="btn-primary" (click)="isDialerOpen.set(true)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Open Dialer
        </button>
      </div>

      <!-- Quick Performance Bar -->
      <div class="stats-row">
        <div class="stat-box">
          <span class="val">{{ myCalls().length }}</span>
          <span class="lbl">Total Placed</span>
        </div>
        <div class="stat-box">
          <span class="val green">{{ completedPercentage() }}%</span>
          <span class="lbl">Completed Rate</span>
        </div>
        <div class="stat-box">
          <span class="val">{{ totalTalkTime() }}</span>
          <span class="lbl">Total Talk Time</span>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="filters-row">
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Filter by claimant name or notes..." class="search-input" />
        </div>

        <div class="chip-group">
          <button class="chip" [class.active]="statusFilter() === 'all'" (click)="statusFilter.set('all')">All Statuses</button>
          <button class="chip" [class.active]="statusFilter() === 'completed'" (click)="statusFilter.set('completed')">Completed</button>
          <button class="chip" [class.active]="statusFilter() === 'voicemail'" (click)="statusFilter.set('voicemail')">Voicemail</button>
          <button class="chip" [class.active]="statusFilter() === 'no_answer'" (click)="statusFilter.set('no_answer')">No Answer</button>
        </div>
      </div>

      <!-- Table Card -->
      <div class="table-card">
        <table class="crm-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Contact / Claimant</th>
              <th>Masked Number (Privacy Protected)</th>
              <th>Direction</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Agent Notes</th>
            </tr>
          </thead>
          <tbody>
            @for (call of filteredCalls(); track call.id) {
              <tr>
                <td class="time-col">{{ formatTimestamp(call.timestamp) }}</td>
                <td>
                  <span class="contact-name">{{ call.customerName || call.leadName || 'Prospect Lead' }}</span>
                </td>
                <td>
                  <crm-phone-display
                    [phone]="call.realPhoneNumber"
                    [maskedPhone]="call.maskedPhoneNumber"
                  />
                </td>
                <td>
                  <span class="dir-badge" [class]="call.direction">{{ call.direction | uppercase }}</span>
                </td>
                <td>{{ formatDuration(call.durationSeconds) }}</td>
                <td>
                  <span class="status-badge" [class]="'status-' + call.status">
                    {{ call.status.replace('_', ' ') | titlecase }}
                  </span>
                </td>
                <td class="notes-cell">{{ call.notes || '—' }}</td>
              </tr>
            }
          </tbody>
        </table>

        @if (filteredCalls().length === 0) {
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3"/>
            </svg>
            <p>No recorded calls matching your filters.</p>
          </div>
        }
      </div>

      <!-- Global Dialer Modal -->
      <crm-dialer-modal
        [isOpen]="isDialerOpen()"
        (closed)="isDialerOpen.set(false)"
      />
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 700; color: var(--crm-text-primary); margin: 0 0 4px; }
    .page-subtitle { font-size: 14px; color: var(--crm-text-secondary); margin: 0; }
    .btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: var(--crm-accent); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
    .btn-primary:hover { opacity: 0.9; }
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-box { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 12px; padding: 16px 20px; display: flex; flex-direction: column; align-items: center; }
    .stat-box .val { font-size: 22px; font-weight: 700; color: var(--crm-text-primary); }
    .stat-box .val.green { color: #16a34a; }
    .stat-box .lbl { font-size: 11px; text-transform: uppercase; font-weight: 600; color: var(--crm-text-muted); margin-top: 2px; }
    .filters-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-box { display: flex; align-items: center; gap: 8px; background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 8px; padding: 8px 12px; flex: 1; max-width: 340px; }
    .search-input { border: none; background: transparent; outline: none; font-size: 13px; color: var(--crm-text-primary); width: 100%; }
    .chip-group { display: flex; gap: 6px; }
    .chip { border: 1px solid var(--crm-border); background: var(--crm-surface); color: var(--crm-text-secondary); font-size: 12px; font-weight: 500; padding: 6px 14px; border-radius: 20px; cursor: pointer; transition: all 0.2s; }
    .chip.active { background: var(--crm-accent); color: #fff; border-color: var(--crm-accent); }
    .table-card { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 14px; overflow: hidden; }
    .crm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .crm-table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--crm-text-muted); border-bottom: 1px solid var(--crm-border); background: var(--crm-surface-2); }
    .crm-table td { padding: 14px 16px; border-bottom: 1px solid var(--crm-border); color: var(--crm-text-secondary); vertical-align: middle; }
    .crm-table tr:last-child td { border-bottom: none; }
    .crm-table tr:hover td { background: var(--crm-surface-2); }
    .time-col { font-size: 12px; color: var(--crm-text-muted); white-space: nowrap; }
    .contact-name { font-weight: 600; color: var(--crm-text-primary); }
    .dir-badge { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
    .dir-badge.outbound { background: #eff6ff; color: #2563eb; }
    .dir-badge.inbound { background: #f0fdf4; color: #16a34a; }
    .status-badge { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px; }
    .status-completed { background: #dcfce7; color: #16a34a; }
    .status-voicemail { background: #eff6ff; color: #2563eb; }
    .status-no_answer { background: #fee2e2; color: #dc2626; }
    .status-busy { background: #fef3c7; color: #d97706; }
    .status-failed { background: #fee2e2; color: #dc2626; }
    .status-in_progress { background: #eff6ff; color: #2563eb; }
    .notes-cell { font-size: 12px; max-width: 280px; }
    .empty-state { text-align: center; padding: 60px 20px; color: var(--crm-text-muted); }
    .empty-state svg { opacity: 0.4; margin-bottom: 12px; }
  `]
})
export class AgentCallsComponent {
  private callService = inject(CallService);
  private authService = inject(AuthService);

  private allCalls = toSignal(this.callService.calls$, { initialValue: [] });

  searchQuery = '';
  statusFilter = signal<string>('all');
  isDialerOpen = signal(false);

  myCalls = computed(() => {
    const agentId = this.authService.currentUser()?.agentId || 'agent-1';
    const list = this.allCalls();
    const assigned = list.filter(c => c.agentId === agentId);
    return assigned.length > 0 ? assigned : list;
  });

  filteredCalls = computed(() => {
    const status = this.statusFilter();
    const query = this.searchQuery.toLowerCase().trim();

    return this.myCalls().filter(c => {
      const matchesStatus = status === 'all' || c.status === status;
      const matchesQuery = !query ||
        (c.customerName && c.customerName.toLowerCase().includes(query)) ||
        (c.leadName && c.leadName.toLowerCase().includes(query)) ||
        (c.notes && c.notes.toLowerCase().includes(query));

      return matchesStatus && matchesQuery;
    });
  });

  completedPercentage = computed(() => {
    const list = this.myCalls();
    if (!list.length) return 0;
    const completed = list.filter(c => c.status === 'completed').length;
    return Math.round((completed / list.length) * 100);
  });

  totalTalkTime = computed(() => {
    const totalSecs = this.myCalls().reduce((sum, c) => sum + (c.durationSeconds || 0), 0);
    const m = Math.floor(totalSecs / 60);
    return `${m} mins`;
  });

  formatDuration(seconds?: number): string {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  formatTimestamp(iso?: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
