import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CallService } from '../../../core/services/call.service';
import { Call } from '../../../core/models/call.model';
import { PhoneDisplayComponent } from '../../../shared/components/phone-display/phone-display.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { DialerModalComponent } from '../../../shared/components/dialer-modal/dialer-modal.component';

@Component({
  selector: 'crm-admin-calls',
  standalone: true,
  imports: [
    CommonModule,
    PhoneDisplayComponent,
    StatusBadgeComponent,
    DialerModalComponent
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Telephony & Outbound Call Logs</h2>
          <p class="subtitle">Complete record of claimant contact attempts, durations, and recorded outcomes.</p>
        </div>
        <button class="btn-dialer" (click)="isDialerOpen.set(true)">
          <img class="real-icon real-icon-inline" src="/assets/icons/phone-handset.png" alt="" aria-hidden="true" /> Launch Dialer
        </button>
      </div>

      <!-- Call Metrics Row -->
      <div class="stats-row">
        <div class="metric-pill">
          <span class="lbl">Total Recorded Calls</span>
          <span class="num">{{ allCalls().length }}</span>
        </div>
        <div class="metric-pill">
          <span class="lbl">Connected Rate</span>
          <span class="num green">78.4%</span>
        </div>
        <div class="metric-pill">
          <span class="lbl">Avg Duration</span>
          <span class="num">5m 40s</span>
        </div>
      </div>

      <!-- Calls Table -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Recipient / Contact</th>
                <th>Protected Phone (Admin Reveal)</th>
                <th>Direction</th>
                <th>Duration</th>
                <th>Outcome / Disposition</th>
                <th>Agent</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              @for (call of allCalls(); track call.id) {
                <tr>
                  <td class="date-cell">{{ call.timestamp | date:'short' }}</td>
                  <td><strong>{{ call.customerName || call.leadName || 'Direct Call' }}</strong></td>
                  <td>
                    <crm-phone-display
                      [phone]="call.realPhoneNumber"
                      [maskedPhone]="call.maskedPhoneNumber"
                      (dial)="onRedial(call)"
                    />
                  </td>
                  <td>
                    <span class="dir-badge" [ngClass]="call.direction">{{ call.direction }}</span>
                  </td>
                  <td>{{ formatDuration(call.durationSeconds) }}</td>
                  <td>
                    <crm-status-badge [status]="call.outcome" />
                  </td>
                  <td>{{ call.agentName }}</td>
                  <td class="notes-col">{{ call.notes || '—' }}</td>
                </tr>
              } @empty {
                <tr><td colspan="8" class="empty">No call records found.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Dialer Modal -->
      <crm-dialer-modal
        [isOpen]="isDialerOpen()"
        [recipientName]="dialTarget()?.name || 'Contact'"
        [recipientPhone]="dialTarget()?.phone || ''"
        [recipientMaskedPhone]="dialTarget()?.maskedPhone || ''"
        (closed)="isDialerOpen.set(false)"
      />
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; h2 { font-size: 1.65rem; color: #0F172A; margin: 0 0 0.25rem 0; } .subtitle { color: #64748B; font-size: 0.925rem; margin: 0; } }
    .btn-dialer { background: #16A34A; color: #FFF; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; &:hover { background: #15803D; } }
    .stats-row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .metric-pill { background: #FFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 0.75rem 1.25rem; display: flex; flex-direction: column; .lbl { font-size: 0.75rem; color: #64748B; text-transform: uppercase; font-weight: 600; } .num { font-size: 1.25rem; font-weight: 700; color: #0F172A; } .num.green { color: #16A34A; } }
    .table-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; th { padding: 0.75rem; color: #64748B; font-weight: 600; text-align: left; border-bottom: 1px solid #E2E8F0; } td { padding: 0.85rem; border-bottom: 1px solid #F1F5F9; color: #334155; } }
    .date-cell { white-space: nowrap; color: #64748B; }
    .dir-badge { padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .dir-badge.outbound { background: #EFF6FF; color: #1D4ED8; }
    .dir-badge.inbound { background: #ECFDF5; color: #047857; }
    .notes-col { max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #64748B; }
    .empty { text-align: center; color: #94A3B8; padding: 2rem; }
  `]
})
export class AdminCallsComponent {
  private callService = inject(CallService);

  allCalls = signal<Call[]>([]);
  isDialerOpen = signal<boolean>(false);
  dialTarget = signal<{ name: string; phone: string; maskedPhone: string } | null>(null);

  constructor() {
    this.callService.calls$.subscribe(calls => {
      this.allCalls.set(calls);
    });
  }

  formatDuration(sec: number): string {
    if (!sec) return '0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  onRedial(call: Call): void {
    this.dialTarget.set({
      name: call.customerName || call.leadName || 'Contact',
      phone: call.realPhoneNumber,
      maskedPhone: call.maskedPhoneNumber
    });
    this.isDialerOpen.set(true);
  }
}
