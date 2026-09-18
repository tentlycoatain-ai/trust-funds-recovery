import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../core/services/payment.service';
import { Payment, PaymentMethod, PaymentType } from '../../../core/models/payment.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'crm-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Disbursements & Contingency Fees</h2>
          <p class="subtitle">Detailed accounting of recovery payouts, court releases, and company earned revenues.</p>
        </div>
        <button class="btn-create" (click)="openCreateModal()">+ Record Disbursement</button>
      </div>

      <!-- Financial Metrics Summary -->
      <div class="metrics-grid">
        <div class="fin-card">
          <span class="fin-title">Net Client Payouts Disbursed</span>
          <span class="fin-value green">\${{ totalClientPayouts() | number:'1.0-0' }}</span>
          <span class="fin-sub">Sent via Wire / ACH / Official Check</span>
        </div>
        <div class="fin-card">
          <span class="fin-title">Total Contingency Fees Retained</span>
          <span class="fin-value blue">\${{ totalFees() | number:'1.0-0' }}</span>
          <span class="fin-sub">Corporate Operating Revenue</span>
        </div>
        <div class="fin-card">
          <span class="fin-title">Pending Court Disbursements</span>
          <span class="fin-value amber">$142,000</span>
          <span class="fin-sub">Awaiting Judicial Order Releases</span>
        </div>
      </div>

      <!-- Payments Table -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Reference #</th>
                <th>Case #</th>
                <th>Claimant</th>
                <th>Gross Recovery</th>
                <th>Contingency Fee</th>
                <th>Net Payout</th>
                <th>Method</th>
                <th>Disbursed Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (pay of payments(); track pay.id) {
                <tr>
                  <td class="font-mono">{{ pay.referenceNumber }}</td>
                  <td class="font-mono text-blue">{{ pay.caseNumber }}</td>
                  <td><strong>{{ pay.customerName }}</strong></td>
                  <td class="font-bold">\${{ pay.amount | number:'1.0-0' }}</td>
                  <td class="text-blue">\${{ pay.feeAmount | number:'1.0-0' }}</td>
                  <td class="text-green font-bold">\${{ pay.clientPayoutAmount | number:'1.0-0' }}</td>
                  <td><span class="method-tag">{{ formatMethod(pay.method) }}</span></td>
                  <td>{{ pay.date | date:'mediumDate' }}</td>
                  <td><crm-status-badge [status]="pay.status" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Record Payment Modal -->
      @if (isCreateModalOpen()) {
        <div class="modal-overlay" (click)="isCreateModalOpen.set(false)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Record New Disbursement</h3>
              <button class="close-btn" (click)="isCreateModalOpen.set(false)"><img class="real-icon real-icon-inline" src="/assets/icons/close-seal.png" alt="" aria-hidden="true" /></button>
            </div>
            <form (ngSubmit)="submitCreatePayment()" class="modal-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Case Number</label>
                  <input type="text" [(ngModel)]="newPay.caseNumber" name="caseNumber" required placeholder="TRF-5012" class="input-ctrl" />
                </div>
                <div class="form-group">
                  <label>Claimant Name</label>
                  <input type="text" [(ngModel)]="newPay.customerName" name="customerName" required class="input-ctrl" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Gross Amount ($)</label>
                  <input type="number" [(ngModel)]="newPay.amount" (ngModelChange)="onAmountChange()" name="amount" required class="input-ctrl" />
                </div>
                <div class="form-group">
                  <label>Fee Amount (25%) ($)</label>
                  <input type="number" [(ngModel)]="newPay.feeAmount" name="feeAmount" required class="input-ctrl" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Payment Method</label>
                  <select [(ngModel)]="newPay.method" name="method" class="input-ctrl">
                    <option value="wire_transfer">Wire Transfer</option>
                    <option value="ach">ACH</option>
                    <option value="check">Cashier Check</option>
                    <option value="direct_deposit">Direct Deposit</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Net Client Payout ($)</label>
                  <input type="number" [value]="newPay.amount - newPay.feeAmount" disabled class="input-ctrl bg-gray" />
                </div>
              </div>
              <div class="form-actions">
                <button type="button" class="btn-cancel" (click)="isCreateModalOpen.set(false)">Cancel</button>
                <button type="submit" class="btn-save">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; h2 { font-size: 1.65rem; color: #0F172A; margin: 0 0 0.25rem 0; } .subtitle { color: #64748B; font-size: 0.925rem; margin: 0; } }
    .btn-create { background: #2563EB; color: #FFF; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; &:hover { background: #1D4ED8; } }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; }
    .fin-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 0.25rem; }
    .fin-title { font-size: 0.75rem; color: #64748B; text-transform: uppercase; font-weight: 600; }
    .fin-value { font-size: 1.75rem; font-weight: 700; }
    .fin-value.green { color: #059669; }
    .fin-value.blue { color: #2563EB; }
    .fin-value.amber { color: #D97706; }
    .fin-sub { font-size: 0.8125rem; color: #94A3B8; }
    .table-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; th { padding: 0.75rem; color: #64748B; font-weight: 600; text-align: left; border-bottom: 1px solid #E2E8F0; } td { padding: 0.85rem; border-bottom: 1px solid #F1F5F9; color: #334155; } }
    .font-mono { font-family: monospace; font-weight: 700; }
    .text-blue { color: #2563EB; }
    .text-green { color: #059669; }
    .method-tag { background: #F1F5F9; color: #475569; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 1050; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .modal-card { background: #FFF; border-radius: 16px; width: 100%; max-width: 520px; overflow: hidden; }
    .modal-header { padding: 1.25rem 1.5rem; background: #0F172A; color: #FFF; display: flex; justify-content: space-between; align-items: center; h3 { margin: 0; color: #FFF; } .close-btn { background: none; border: none; color: #94A3B8; font-size: 1.25rem; cursor: pointer; } }
    .modal-form { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; label { font-size: 0.8125rem; font-weight: 600; color: #475569; } }
    .input-ctrl { padding: 0.65rem 0.85rem; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 0.875rem; }
    .bg-gray { background: #F8FAFC; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }
    .btn-cancel { padding: 0.65rem 1.25rem; border: 1px solid #CBD5E1; background: #FFF; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-save { padding: 0.65rem 1.25rem; background: #2563EB; color: #FFF; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
  `]
})
export class AdminPaymentsComponent {
  private paymentService = inject(PaymentService);
  private toastService = inject(ToastService);

  payments = signal<Payment[]>([]);
  isCreateModalOpen = signal<boolean>(false);

  newPay = {
    caseNumber: '',
    customerName: '',
    amount: 80000,
    feeAmount: 20000,
    method: 'wire_transfer' as PaymentMethod
  };

  constructor() {
    this.paymentService.payments$.subscribe(list => {
      this.payments.set(list);
    });
  }

  totalClientPayouts(): number {
    return this.payments().reduce((sum, p) => sum + (p.clientPayoutAmount || 0), 0);
  }

  totalFees(): number {
    return this.payments().reduce((sum, p) => sum + (p.feeAmount || 0), 0);
  }

  formatMethod(m: PaymentMethod): string {
    return m.replace(/_/g, ' ');
  }

  onAmountChange(): void {
    this.newPay.feeAmount = Math.round(Number(this.newPay.amount) * 0.25);
  }

  openCreateModal(): void {
    this.newPay = {
      caseNumber: '',
      customerName: '',
      amount: 80000,
      feeAmount: 20000,
      method: 'wire_transfer'
    };
    this.isCreateModalOpen.set(true);
  }

  submitCreatePayment(): void {
    const net = Number(this.newPay.amount) - Number(this.newPay.feeAmount);
    this.paymentService.createPayment({
      caseId: 'case-1',
      caseNumber: this.newPay.caseNumber,
      customerId: 'cust-1',
      customerName: this.newPay.customerName,
      amount: Number(this.newPay.amount),
      feeAmount: Number(this.newPay.feeAmount),
      clientPayoutAmount: net,
      type: 'recovery_payout',
      method: this.newPay.method,
      status: 'completed'
    }).subscribe(p => {
      this.toastService.success(`Payment ${p.referenceNumber} recorded!`);
      this.isCreateModalOpen.set(false);
    });
  }
}
