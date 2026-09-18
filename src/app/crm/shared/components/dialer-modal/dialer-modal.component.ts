import { Component, Input, Output, EventEmitter, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { CallService } from '../../../core/services/call.service';
import { CallOutcome } from '../../../core/models/call.model';

@Component({
  selector: 'crm-dialer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="dialer-dialog" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="dialog-header">
            <div class="title-with-icon">
              <span class="phone-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </span>
              <div>
                <h3>Telephony Dialer</h3>
                <span class="target-name">{{ recipientName || 'Contact Call' }}</span>
              </div>
            </div>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>

          <!-- Body -->
          <div class="dialer-body">
            <!-- Screen Display -->
            <div class="call-screen" [class.active]="callState() === 'in_call'">
              <div class="number-display">
                {{ displayPhone() }}
              </div>
              <div class="status-indicator">
                @if (callState() === 'idle') {
                  <span class="idle-text">Ready to connect</span>
                } @else if (callState() === 'dialing') {
                  <span class="pulse-text">Connecting line...</span>
                } @else if (callState() === 'in_call') {
                  <span class="connected-badge">● Active Call — {{ formattedTimer() }}</span>
                } @else if (callState() === 'ended') {
                  <span class="ended-badge">Call Ended (Duration: {{ formattedTimer() }})</span>
                }
              </div>
            </div>

            <!-- Call Controls -->
            <div class="call-controls">
              @if (callState() === 'idle') {
                <button type="button" class="btn-call" (click)="startCall()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Initiate Call
                </button>
              } @else if (callState() === 'dialing' || callState() === 'in_call') {
                <button type="button" class="btn-hangup" (click)="endCall()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/>
                    <line x1="23" y1="1" x2="1" y2="23"/>
                  </svg>
                  End Call
                </button>
              }
            </div>

            <!-- Post Call Disposition Form -->
            @if (callState() === 'ended') {
              <div class="disposition-box">
                <h4>Call Disposition & Log</h4>
                <div class="form-group">
                  <label>Outcome</label>
                  <select [(ngModel)]="outcome" class="input-select">
                    <option value="interested">Interested</option>
                    <option value="contract_requested">Contract Requested</option>
                    <option value="information_provided">Information Provided</option>
                    <option value="call_back_requested">Call Back Requested</option>
                    <option value="voicemail">Left Voicemail</option>
                    <option value="not_interested">Not Interested</option>
                    <option value="wrong_number">Wrong Number</option>
                    <option value="do_not_call">Do Not Call</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Call Notes</label>
                  <textarea [(ngModel)]="callNotes" rows="3" placeholder="Enter conversation details..." class="input-textarea"></textarea>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn-save" (click)="saveCallLog()">Save & Log Call</button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1050;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .dialer-dialog {
      background: #FFFFFF;
      border-radius: 16px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      animation: popIn 200ms ease;
    }
    @keyframes popIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      background: #0F172A;
      color: #FFFFFF;

      h3 {
        color: #FFFFFF;
        font-size: 1.1rem;
        margin: 0;
      }
    }
    .title-with-icon {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .phone-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #38BDF8;
    }
    .target-name {
      font-size: 0.8125rem;
      color: #94A3B8;
    }
    .close-btn {
      color: #94A3B8;
      font-size: 1.25rem;
      cursor: pointer;
      &:hover { color: #FFFFFF; }
    }
    .dialer-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .call-screen {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      &.active {
        background: #F0FDF4;
        border-color: #86EFAC;
      }
    }
    .number-display {
      font-family: monospace;
      font-size: 1.5rem;
      font-weight: 700;
      color: #0F172A;
    }
    .status-indicator {
      font-size: 0.875rem;
      font-weight: 500;
    }
    .idle-text { color: #64748B; }
    .pulse-text { color: #2563EB; animation: pulse 1s infinite; }
    .connected-badge { color: #16A34A; font-weight: 600; }
    .ended-badge { color: #DC2626; }

    .call-controls {
      display: flex;
      justify-content: center;
    }
    .btn-call {
      background: #16A34A;
      color: #FFFFFF;
      font-weight: 600;
      padding: 0.875rem 2rem;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
      &:hover { background: #15803D; }
    }
    .btn-hangup {
      background: #DC2626;
      color: #FFFFFF;
      font-weight: 600;
      padding: 0.875rem 2rem;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
      &:hover { background: #B91C1C; }
    }
    .disposition-box {
      border-top: 1px solid #E2E8F0;
      padding-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;

      h4 {
        font-size: 0.95rem;
        color: #0F172A;
        margin: 0;
      }
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      label {
        font-size: 0.8125rem;
        font-weight: 600;
        color: #475569;
      }
    }
    .input-select, .input-textarea {
      width: 100%;
      padding: 0.65rem 0.85rem;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      font-size: 0.875rem;
      &:focus { outline: 2px solid #2563EB; border-color: transparent; }
    }
    .btn-save {
      background: #2563EB;
      color: #FFFFFF;
      font-weight: 600;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      width: 100%;
      &:hover { background: #1D4ED8; }
    }
  `]
})
export class DialerModalComponent implements OnDestroy {
  private authService = inject(AuthService);
  private callService = inject(CallService);

  @Input() isOpen = false;
  @Input() recipientName = '';
  @Input() recipientPhone = '';
  @Input() recipientMaskedPhone = '';
  @Input() customerId?: string;
  @Input() leadId?: string;

  @Output() closed = new EventEmitter<void>();
  @Output() callLogged = new EventEmitter<any>();

  callState = signal<'idle' | 'dialing' | 'in_call' | 'ended'>('idle');
  durationSeconds = signal<number>(0);
  outcome: CallOutcome = 'information_provided';
  callNotes = '';

  private timerInterval?: any;

  displayPhone(): string {
    const isAdmin = this.authService.isAdmin();
    if (!isAdmin) {
      return this.recipientMaskedPhone || '+1 (***) ***-****';
    }
    return this.recipientPhone || this.recipientMaskedPhone || '+1 (***) ***-****';
  }

  formattedTimer(): string {
    const s = this.durationSeconds();
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  startCall(): void {
    this.callState.set('dialing');
    setTimeout(() => {
      this.callState.set('in_call');
      this.startTimer();
    }, 1500);
  }

  endCall(): void {
    this.stopTimer();
    this.callState.set('ended');
  }

  saveCallLog(): void {
    const user = this.authService.currentUser();
    this.callService.logCall({
      agentId: user?.agentId || user?.id || 'agent-1',
      agentName: user?.name || 'Agent',
      customerId: this.customerId,
      customerName: this.recipientName,
      leadId: this.leadId,
      direction: 'outbound',
      realPhoneNumber: this.recipientPhone || '+1 (555) 000-0000',
      durationSeconds: this.durationSeconds(),
      status: 'completed',
      outcome: this.outcome,
      notes: this.callNotes
    }).subscribe(call => {
      this.callLogged.emit(call);
      this.closeModal();
    });
  }

  closeModal(): void {
    this.stopTimer();
    this.callState.set('idle');
    this.durationSeconds.set(0);
    this.callNotes = '';
    this.closed.emit();
  }

  private startTimer(): void {
    this.durationSeconds.set(0);
    this.timerInterval = setInterval(() => {
      this.durationSeconds.update(s => s + 1);
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
