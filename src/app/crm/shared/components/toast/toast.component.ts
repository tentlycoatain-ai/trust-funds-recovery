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
          <div class="toast-icon">
            @if (toast.type === 'success') {
              <img class="real-icon real-icon-inline" src="/assets/icons/coin-stack.png" alt="" aria-hidden="true" />
            } @else if (toast.type === 'error') {
              <img class="real-icon real-icon-inline" src="/assets/icons/coin-stack.png" alt="" aria-hidden="true" />
            } @else {
              <img class="real-icon real-icon-inline" src="/assets/icons/coin-stack.png" alt="" aria-hidden="true" />
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
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      pointer-events: none;
      max-width: 380px;
      width: 100%;
    }
    .toast-item {
      pointer-events: auto;
      background: #0F172A;
      color: #FFFFFF;
      border-radius: 10px;
      padding: 0.85rem 1rem;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      animation: slideIn 220ms ease;
      border-left: 4px solid #38BDF8;

      &.toast-success {
        border-left-color: #10B981;
        .toast-icon { color: #34D399; }
      }
      &.toast-error {
        border-left-color: #EF4444;
        .toast-icon { color: #F87171; }
      }
      &.toast-warning {
        border-left-color: #F59E0B;
        .toast-icon { color: #FBBF24; }
      }
      &.toast-info {
        border-left-color: #3B82F6;
        .toast-icon { color: #60A5FA; }
      }
    }
    @keyframes slideIn {
      from { transform: translateY(12px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .toast-icon {
      flex-shrink: 0;
      margin-top: 2px;
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
      color: #F8FAFC;
    }
    .toast-message {
      font-size: 0.8125rem;
      color: #CBD5E1;
      line-height: 1.4;
    }
    .toast-close {
      color: #94A3B8;
      background: none;
      border: none;
      font-size: 0.875rem;
      cursor: pointer;
      margin-left: 0.25rem;
      &:hover { color: #FFFFFF; }
    }
  `]
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
