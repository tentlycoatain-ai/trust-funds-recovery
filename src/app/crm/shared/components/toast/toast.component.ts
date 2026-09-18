import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'crm-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [ngClass]="'toast-' + toast.type">
          <img class="toast-brand" src="/assets/brand/tfr-mark.svg" alt="Trust Funds Recovery" />
          <div class="toast-icon">
            @if (toast.type === 'success') {
              <img class="real-icon real-icon-inline" src="/assets/icons/verified-stamp.png" alt="" aria-hidden="true" />
            } @else if (toast.type === 'error') {
              <img class="real-icon real-icon-inline" src="/assets/icons/warning-file.png" alt="" aria-hidden="true" />
            } @else if (toast.type === 'warning') {
              <img class="real-icon real-icon-inline" src="/assets/icons/calendar-desk.png" alt="" aria-hidden="true" />
            } @else {
              <img class="real-icon real-icon-inline" src="/assets/icons/document-folder.png" alt="" aria-hidden="true" />
            }
          </div>
          <div class="toast-content">
            @if (toast.title) {
              <strong class="toast-title">{{ toast.title }}</strong>
            }
            <span class="toast-message">{{ toast.message }}</span>
          </div>
          <button class="toast-close" (click)="toastService.remove(toast.id)"><img class="real-icon real-icon-inline" src="/assets/icons/close-seal.png" alt="" aria-hidden="true" /></button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 2300;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      pointer-events: none;
      max-width: 420px;
      width: 100%;
    }
    .toast-item {
      pointer-events: auto;
      background: rgba(17, 26, 46, .97);
      color: #FFFFFF;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 18px;
      padding: .85rem 1rem .85rem .85rem;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      box-shadow: 0 18px 48px rgba(10,16,32,.24);
      animation: slideIn 260ms cubic-bezier(.16,1,.3,1);
      border-left: 3px solid #83A4FF;

      &.toast-success {
        border-left-color: #43C38B;
      }
      &.toast-error {
        border-left-color: #E47C83;
      }
      &.toast-warning {
        border-left-color: #E1BF79;
      }
      &.toast-info {
        border-left-color: #83A4FF;
      }
    }
    @keyframes slideIn {
      from { transform: translateY(12px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .toast-brand { width: 28px; height: 28px; flex: 0 0 auto; padding: 5px; background: #FFF; border-radius: 9px; }
    .toast-icon {
      flex-shrink: 0;
      width: 22px;
      height: 22px;
      margin-top: 3px;
      display: grid;
      place-items: center;
      border-radius: 7px;
      background: rgba(255,255,255,.08);
    }
    .toast-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .toast-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #FFFFFF;
    }
    .toast-message {
      font-size: 0.8125rem;
      color: #B8C3D5;
      line-height: 1.4;
    }
    .toast-close {
      color: #AAB6C9;
      background: none;
      border: none;
      font-size: 0.875rem;
      cursor: pointer;
      margin-left: 0.25rem;
      &:hover { color: #FFFFFF; }
    }
    @media (max-width: 560px) { .toast-container { top: .75rem; right: .75rem; left: .75rem; max-width: none; } }
  `]
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
