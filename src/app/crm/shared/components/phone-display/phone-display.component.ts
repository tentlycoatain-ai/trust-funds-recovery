import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'crm-phone-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="phone-wrapper" [class.is-agent]="!isAdmin()">
      <span class="phone-number" [title]="isAdmin() ? 'Click reveal to view unmasked' : 'Protected contact number'">
        {{ displayedPhone() }}
      </span>

      @if (isAdmin()) {
        <button
          type="button"
          class="icon-btn reveal-btn"
          (click)="toggleReveal($event)"
          [title]="isRevealed() ? 'Hide phone number' : 'Reveal real phone number (Admin)'">
          @if (isRevealed()) {
            <!-- Eye slash icon -->
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          } @else {
            <!-- Eye icon -->
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          }
        </button>
      } @else {
        <!-- Agent lock indicator -->
        <span class="lock-tag" title="Masked for privacy compliance">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </span>
      }

      @if (showDial) {
        <button
          type="button"
          class="icon-btn dial-btn"
          (click)="handleDial($event)"
          title="Launch Telephony Dialer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </button>
      }
    </div>
  `,
  styles: [`
    .phone-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-family: monospace, sans-serif;
      font-size: 0.875rem;
    }
    .phone-number {
      font-weight: 500;
      color: var(--color-navy-900, #0F172A);
      letter-spacing: 0.02em;
    }
    .icon-btn {
      background: none;
      border: 1px solid var(--crm-border, #E2E8F0);
      border-radius: 4px;
      padding: 3px 5px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #64748B;
      transition: all 150ms ease;

      &:hover {
        background-color: #F1F5F9;
        color: #0F172A;
        border-color: #CBD5E1;
      }
    }
    .dial-btn {
      color: #16A34A;
      border-color: #BBF7D0;
      background-color: #F0FDF4;

      &:hover {
        background-color: #DCFCE7;
        color: #15803D;
        border-color: #86EFAC;
      }
    }
    .lock-tag {
      display: inline-flex;
      align-items: center;
      color: #94A3B8;
    }
  `]
})
export class PhoneDisplayComponent {
  private authService = inject(AuthService);

  @Input() phone: string = '';
  @Input() maskedPhone: string = '';
  @Input() showDial: boolean = true;

  @Output() dial = new EventEmitter<string>();

  isRevealed = signal<boolean>(false);

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  displayedPhone(): string {
    // If agent, NEVER reveal real phone number
    if (!this.isAdmin()) {
      return this.maskedPhone || '+1 (***) ***-****';
    }
    // If admin and revealed, show full phone
    if (this.isRevealed() && this.phone) {
      return this.phone;
    }
    return this.maskedPhone || (this.phone ? this.mask(this.phone) : '+1 (***) ***-****');
  }

  toggleReveal(event: MouseEvent): void {
    event.stopPropagation();
    if (this.isAdmin()) {
      this.isRevealed.update(v => !v);
    }
  }

  handleDial(event: MouseEvent): void {
    event.stopPropagation();
    // Pass masked phone for agent, phone for admin
    const target = this.isAdmin() && this.phone ? this.phone : (this.maskedPhone || this.phone);
    this.dial.emit(target);
  }

  private mask(p: string): string {
    const digits = p.replace(/\D/g, '');
    const lastFour = digits.slice(-4) || '0000';
    return `+1 (***) ***-${lastFour}`;
  }
}
