import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'crm-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [ngClass]="getBadgeClass()">
      <span class="dot"></span>
      {{ getLabel() }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.65rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 9999px;
      letter-spacing: 0.02em;
      white-space: nowrap;
      text-transform: capitalize;
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: currentColor;
    }

    .badge-success {
      background-color: #ECFDF5;
      color: #059669;
      border: 1px solid #A7F3D0;
    }
    .badge-info {
      background-color: #EFF6FF;
      color: #2563EB;
      border: 1px solid #BFDBFE;
    }
    .badge-warning {
      background-color: #FFFBEB;
      color: #D97706;
      border: 1px solid #FDE68A;
    }
    .badge-purple {
      background-color: #F5F3FF;
      color: #7C3AED;
      border: 1px solid #DDD6FE;
    }
    .badge-danger {
      background-color: #FEF2F2;
      color: #DC2626;
      border: 1px solid #FECACA;
    }
    .badge-neutral {
      background-color: #F1F5F9;
      color: #475569;
      border: 1px solid #E2E8F0;
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';
  @Input() label?: string;

  getLabel(): string {
    if (this.label) return this.label;
    if (!this.status) return '';
    return this.status.replace(/_/g, ' ');
  }

  getBadgeClass(): string {
    const s = this.status?.toLowerCase();
    switch (s) {
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
        return 'badge-danger';

      case 'on_hold':
      case 'closed':
      case 'cancelled':
      case 'archived':
      case 'inactive':
      case 'draft':
      case 'low':
      default:
        return 'badge-neutral';
    }
  }
}
