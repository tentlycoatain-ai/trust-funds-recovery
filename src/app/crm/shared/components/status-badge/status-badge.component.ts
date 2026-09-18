import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'crm-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [ngClass]="getBadgeClass()">
      <span class="status-icon" aria-hidden="true">{{ getSymbol() }}</span>
      <span>{{ getLabel() }}</span>
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: .38rem;
      min-height: 24px;
      padding: .25rem .58rem;
      border: 1px solid transparent;
      border-radius: 999px;
      font-size: .70rem;
      font-weight: 750;
      letter-spacing: .025em;
      line-height: 1;
      white-space: nowrap;
      text-transform: capitalize;
    }
    .status-icon { display: inline-flex; width: .9rem; align-items: center; justify-content: center; font-size: .74rem; font-weight: 800; }
    .badge-success { color: var(--color-success-strong); background: var(--color-success-bg); border-color: var(--color-success-border); }
    .badge-info { color: var(--color-info); background: var(--color-info-bg); border-color: var(--color-info-border); }
    .badge-warning { color: var(--color-warning); background: var(--color-warning-bg); border-color: var(--color-warning-border); }
    .badge-purple { color: #6340A8; background: #F4F0FF; border-color: #DCD1FA; }
    .badge-danger { color: var(--color-danger); background: var(--color-danger-bg); border-color: var(--color-danger-border); }
    .badge-neutral { color: #51647D; background: #F0F3F7; border-color: #DDE5EF; }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';
  @Input() label?: string;

  getLabel(): string {
    if (this.label) return this.label;
    return this.status ? this.status.replace(/_/g, ' ') : '';
  }

  getSymbol(): string {
    const status = this.status?.toLowerCase();
    if (['completed', 'verified', 'contract_signed', 'converted', 'active'].includes(status)) return '✓';
    if (['urgent', 'high', 'failed', 'rejected', 'unqualified', 'bad_lead', 'overdue'].includes(status)) return '!';
    if (['pending', 'under_review', 'documents_required', 'assessment', 'processing', 'medium'].includes(status)) return '•';
    if (['in_progress', 'recovery_processing', 'awaiting_client'].includes(status)) return '↗';
    return '–';
  }

  getBadgeClass(): string {
    const status = this.status?.toLowerCase();
    switch (status) {
      case 'active':
      case 'completed':
      case 'verified':
      case 'contract_signed':
      case 'converted':
        return 'badge-success';
      case 'new':
      case 'interested':
      case 'contacted':
      case 'contract_sent':
        return 'badge-info';
      case 'under_review':
      case 'documents_required':
      case 'assessment':
      case 'pending':
      case 'pending_review':
      case 'processing':
      case 'medium':
        return 'badge-warning';
      case 'in_progress':
      case 'recovery_processing':
      case 'awaiting_client':
        return 'badge-purple';
      case 'urgent':
      case 'high':
      case 'failed':
      case 'rejected':
      case 'unqualified':
      case 'bad_lead':
      case 'overdue':
        return 'badge-danger';
      default:
        return 'badge-neutral';
    }
  }
}
