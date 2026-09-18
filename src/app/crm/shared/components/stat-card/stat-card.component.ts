import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'crm-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card" [ngClass]="theme">
      <div class="stat-header">
        <span class="stat-title">{{ title }}</span>
        @if (icon) {
          <div class="stat-icon-wrapper" [ngClass]="iconColor">
            <span class="stat-icon" [innerHTML]="icon"></span>
          </div>
        }
      </div>

      <div class="stat-value">{{ value }}</div>

      @if (trend || subtitle) {
        <div class="stat-footer">
          @if (trend) {
            <span class="stat-trend" [ngClass]="isPositive ? 'trend-up' : 'trend-down'">
              @if (isPositive) { ↑ } @else { ↓ }
              {{ trend }}
            </span>
          }
          @if (subtitle) {
            <span class="stat-subtitle">{{ subtitle }}</span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .stat-card {
      background: var(--crm-card-bg, #FFFFFF);
      border: 1px solid var(--crm-border, #E2E8F0);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;

      &:hover {
        border-color: #CBD5E1;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        transform: translateY(-2px);
      }
    }

    .stat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .stat-title {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .stat-icon-wrapper {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #F1F5F9;
      color: #334155;

      &.blue {
        background-color: #EFF6FF;
        color: #2563EB;
      }
      &.emerald {
        background-color: #ECFDF5;
        color: #059669;
      }
      &.amber {
        background-color: #FFFBEB;
        color: #D97706;
      }
      &.purple {
        background-color: #F5F3FF;
        color: #7C3AED;
      }
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #0F172A;
      line-height: 1.15;
      letter-spacing: -0.02em;
    }

    .stat-footer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      margin-top: 0.25rem;
    }

    .stat-trend {
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;

      &.trend-up {
        color: #16A34A;
      }
      &.trend-down {
        color: #DC2626;
      }
    }

    .stat-subtitle {
      color: #94A3B8;
    }
  `]
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() subtitle?: string;
  @Input() trend?: string;
  @Input() isPositive: boolean = true;
  @Input() icon?: string;
  @Input() iconColor: 'blue' | 'emerald' | 'amber' | 'purple' = 'blue';
  @Input() theme: string = '';
}
