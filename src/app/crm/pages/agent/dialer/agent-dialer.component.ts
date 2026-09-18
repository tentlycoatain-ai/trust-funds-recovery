import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { CallService } from '../../../core/services/call.service';
import { CustomerService } from '../../../core/services/customer.service';
import { LeadService } from '../../../core/services/lead.service';
import { PhoneDisplayComponent } from '../../../shared/components/phone-display/phone-display.component';
import { DialerModalComponent } from '../../../shared/components/dialer-modal/dialer-modal.component';

@Component({
  selector: 'crm-agent-dialer',
  standalone: true,
  imports: [CommonModule, FormsModule, PhoneDisplayComponent, DialerModalComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Agent Softphone & Dialer</h1>
          <p class="page-subtitle">Telephony gateway with strict caller privacy masking, live call notes, and disposition logging</p>
        </div>
        <div class="telephony-status">
          <span class="status-dot online"></span>
          <span>WebRTC Line Active</span>
        </div>
      </div>

      <div class="dialer-layout">
        <!-- Left: Keypad & Dialer Console -->
        <div class="keypad-card">
          <div class="card-title">Direct Dial Console</div>

          <!-- Digits Input Screen -->
          <div class="dial-screen">
            <span class="dialed-digits">{{ dialedNumber || 'Enter digits...' }}</span>
            @if (dialedNumber) {
              <button class="backspace-btn" (click)="backspace()">⌫</button>
            }
          </div>

          <!-- Keypad Grid -->
          <div class="keypad-grid">
            @for (btn of keyButtons; track btn.digit) {
              <button type="button" class="key-btn" (click)="pressDigit(btn.digit)">
                <span class="key-num">{{ btn.digit }}</span>
                <span class="key-sub">{{ btn.sub }}</span>
              </button>
            }
          </div>

          <!-- Call / Clear Actions -->
          <div class="keypad-actions">
            <button class="btn-clear" (click)="clearDialer()" [disabled]="!dialedNumber">Clear</button>
            <button class="btn-dial-green" (click)="dialManual()" [disabled]="!dialedNumber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Connect
            </button>
          </div>
        </div>

        <!-- Right: Fast Dial Contacts & Recent Calls -->
        <div class="contacts-column">
          <!-- Queue / Speed Dial -->
          <div class="panel-card">
            <div class="panel-header">
              <span class="panel-title">Assigned Queue (Claimants & Leads)</span>
              <span class="panel-badge">{{ speedDialContacts().length }} in Queue</span>
            </div>

            <div class="contacts-list">
              @for (contact of speedDialContacts(); track contact.id) {
                <div class="contact-item">
                  <div class="contact-info">
                    <span class="c-name">{{ contact.name }}</span>
                    <span class="c-type">{{ contact.type | uppercase }} — {{ contact.detail }}</span>
                    <div class="c-phone">
                      <crm-phone-display 
                        [maskedPhone]="contact.maskedPhone" 
                        [phone]="contact.realPhone"
                      />
                    </div>
                  </div>
                  <button class="call-icon-btn" (click)="openDialerForContact(contact)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Recent Call Sessions -->
          <div class="panel-card">
            <div class="panel-header">
              <span class="panel-title">My Recent Call Activity</span>
            </div>
            <div class="recent-calls-list">
              @for (call of recentCalls(); track call.id) {
                <div class="recent-call-item">
                  <div class="call-type-icon" [class]="'call-' + call.status">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3"/>
                    </svg>
                  </div>
                  <div class="call-meta">
                    <span class="rc-name">{{ call.customerName || call.leadName || 'Direct Claimant' }}</span>
                    <span class="rc-sub">{{ call.status | titlecase }} • {{ formatDuration(call.durationSeconds) }}</span>
                  </div>
                  <span class="rc-time">{{ formatTimeAgo(call.timestamp) }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Unified Telephony Modal -->
      <crm-dialer-modal
        [isOpen]="isModalOpen"
        [customerId]="activeCustomerId"
        [recipientName]="activeRecipientName"
        [recipientMaskedPhone]="activeMaskedPhone"
        [recipientPhone]="activeRealPhone"
        (closed)="isModalOpen = false"
      />
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 700; color: var(--crm-text-primary); margin: 0 0 4px; }
    .page-subtitle { font-size: 14px; color: var(--crm-text-secondary); margin: 0; }
    .telephony-status { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #16a34a; background: #f0fdf4; border: 1px solid #86efac; padding: 6px 14px; border-radius: 20px; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #16a34a; }
    .dialer-layout { display: grid; grid-template-columns: 320px 1fr; gap: 24px; align-items: start; }
    .keypad-card { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 16px; padding: 22px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
    .card-title { font-size: 15px; font-weight: 700; color: var(--crm-text-primary); margin-bottom: 16px; }
    .dial-screen { background: var(--crm-surface-2); border: 1px solid var(--crm-border); border-radius: 12px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; min-height: 48px; margin-bottom: 18px; }
    .dialed-digits { font-size: 18px; font-weight: 600; color: var(--crm-text-primary); letter-spacing: 2px; font-family: monospace; }
    .backspace-btn { background: none; border: none; font-size: 16px; color: var(--crm-text-muted); cursor: pointer; }
    .keypad-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 18px; }
    .key-btn { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 12px; padding: 12px 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; }
    .key-btn:hover { background: var(--crm-surface-2); border-color: var(--crm-accent); }
    .key-btn:active { transform: scale(0.96); }
    .key-num { font-size: 18px; font-weight: 700; color: var(--crm-text-primary); }
    .key-sub { font-size: 9px; text-transform: uppercase; color: var(--crm-text-muted); font-weight: 600; margin-top: 2px; }
    .keypad-actions { display: flex; gap: 10px; }
    .btn-clear { flex: 1; padding: 12px; border-radius: 10px; border: 1px solid var(--crm-border); background: var(--crm-surface); color: var(--crm-text-secondary); font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-clear:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-dial-green { flex: 2; padding: 12px; border-radius: 10px; border: none; background: #16a34a; color: white; font-size: 14px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: opacity 0.2s; }
    .btn-dial-green:hover { opacity: 0.9; }
    .btn-dial-green:disabled { opacity: 0.5; cursor: not-allowed; }
    .contacts-column { display: flex; flex-direction: column; gap: 20px; }
    .panel-card { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 16px; padding: 20px; }
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .panel-title { font-size: 15px; font-weight: 700; color: var(--crm-text-primary); }
    .panel-badge { font-size: 11px; font-weight: 600; background: rgba(59,130,246,0.1); color: var(--crm-accent); padding: 3px 8px; border-radius: 12px; }
    .contacts-list { display: flex; flex-direction: column; gap: 10px; }
    .contact-item { display: flex; justify-content: space-between; align-items: center; background: var(--crm-surface-2); border: 1px solid var(--crm-border); border-radius: 10px; padding: 12px 14px; }
    .contact-info { display: flex; flex-direction: column; gap: 3px; }
    .c-name { font-size: 14px; font-weight: 600; color: var(--crm-text-primary); }
    .c-type { font-size: 11px; color: var(--crm-text-muted); font-weight: 600; }
    .c-phone { margin-top: 2px; }
    .call-icon-btn { width: 36px; height: 36px; border-radius: 50%; border: none; background: #16a34a; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.15s; }
    .call-icon-btn:hover { transform: scale(1.08); }
    .recent-calls-list { display: flex; flex-direction: column; gap: 8px; }
    .recent-call-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; transition: background 0.15s; }
    .recent-call-item:hover { background: var(--crm-surface-2); }
    .call-type-icon { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .call-completed { background: #dcfce7; color: #16a34a; }
    .call-voicemail { background: #eff6ff; color: #2563eb; }
    .call-no_answer { background: #fee2e2; color: #dc2626; }
    .call-busy { background: #fef3c7; color: #d97706; }
    .call-meta { flex: 1; min-width: 0; }
    .rc-name { font-size: 13px; font-weight: 600; color: var(--crm-text-primary); display: block; }
    .rc-sub { font-size: 11px; color: var(--crm-text-muted); }
    .rc-time { font-size: 11px; color: var(--crm-text-muted); }
    @media (max-width: 768px) { .dialer-layout { grid-template-columns: 1fr; } }
  `]
})
export class AgentDialerComponent {
  private callService = inject(CallService);
  private customerService = inject(CustomerService);
  private leadService = inject(LeadService);

  private allCalls = toSignal(this.callService.calls$, { initialValue: [] });
  private allCustomers = toSignal(this.customerService.customers$, { initialValue: [] });
  private allLeads = toSignal(this.leadService.leads$, { initialValue: [] });

  dialedNumber = '';

  isModalOpen = false;
  activeCustomerId?: string;
  activeRecipientName = '';
  activeMaskedPhone = '';
  activeRealPhone = '';

  keyButtons = [
    { digit: '1', sub: '' },
    { digit: '2', sub: 'ABC' },
    { digit: '3', sub: 'DEF' },
    { digit: '4', sub: 'GHI' },
    { digit: '5', sub: 'JKL' },
    { digit: '6', sub: 'MNO' },
    { digit: '7', sub: 'PQRS' },
    { digit: '8', sub: 'TUV' },
    { digit: '9', sub: 'WXYZ' },
    { digit: '*', sub: '' },
    { digit: '0', sub: '+' },
    { digit: '#', sub: '' }
  ];

  speedDialContacts = computed(() => {
    const custs = this.allCustomers().slice(0, 3).map(c => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      type: 'Customer',
      detail: c.customerNumber,
      maskedPhone: c.maskedPhone || '+1 (***) ***-****',
      realPhone: c.phone
    }));
    const leads = this.allLeads().slice(0, 3).map(l => ({
      id: l.id,
      name: l.fullName,
      type: 'Lead',
      detail: l.leadNumber,
      maskedPhone: l.maskedPhone || '+1 (***) ***-****',
      realPhone: l.phone
    }));
    return [...custs, ...leads];
  });

  recentCalls = computed(() => this.allCalls().slice(0, 5));

  pressDigit(digit: string) {
    this.dialedNumber += digit;
  }

  backspace() {
    this.dialedNumber = this.dialedNumber.slice(0, -1);
  }

  clearDialer() {
    this.dialedNumber = '';
  }

  dialManual() {
    if (!this.dialedNumber) return;
    this.activeRecipientName = 'Outbound Direct Dial';
    this.activeMaskedPhone = this.dialedNumber;
    this.activeRealPhone = this.dialedNumber;
    this.activeCustomerId = undefined;
    this.isModalOpen = true;
  }

  openDialerForContact(contact: any) {
    this.activeRecipientName = contact.name;
    this.activeMaskedPhone = contact.maskedPhone;
    this.activeRealPhone = contact.realPhone;
    this.activeCustomerId = contact.type === 'Customer' ? contact.id : undefined;
    this.isModalOpen = true;
  }

  formatDuration(seconds?: number): string {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  formatTimeAgo(iso?: string): string {
    if (!iso) return 'Recent';
    const diff = Math.floor((new Date().getTime() - new Date(iso).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  }
}
