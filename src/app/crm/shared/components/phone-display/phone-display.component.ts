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
            <img class="real-icon real-icon-inline" src="/assets/icons/phone-handset.png" alt="" aria-hidden="true" />
          } @else {
            <!-- Eye icon -->
            <img class="real-icon real-icon-inline" src="/assets/icons/phone-handset.png" alt="" aria-hidden="true" />
          }
        </button>
      } @else {
        <!-- Agent lock indicator -->
        <span class="lock-tag" title="Masked for privacy compliance">
          <img class="real-icon real-icon-inline" src="/assets/icons/phone-handset.png" alt="" aria-hidden="true" />
        </span>
      }

      @if (showDial) {
        <button
          type="button"
          class="icon-btn dial-btn"
          (click)="handleDial($event)"
          title="Launch Telephony Dialer">
          <img class="real-icon real-icon-inline" src="/assets/icons/phone-handset.png" alt="" aria-hidden="true" />
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
