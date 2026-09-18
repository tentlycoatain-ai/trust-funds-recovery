import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CrmCaseService } from '../../../core/services/case.service';
import { RecoveryCase, CaseStatus } from '../../../core/models/case.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'crm-admin-cases',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StatusBadgeComponent],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h2>Recovery Cases Management</h2>
          <p class="subtitle">Oversee judicial proceedings, escrow disbursements, and contingency fee recoveries.</p>
        </div>
        <button class="btn-create" (click)="openCreateModal()">+ Open New Case</button>
      </div>

      <!-- Filters & Search -->
      <div class="filters-card">
        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search case #, client name, jurisdiction..." class="search-input" />
        </div>

        <div class="status-filters">
          <button [class.active]="selectedStatus() === 'all'" (click)="selectedStatus.set('all')">All</button>
          <button [class.active]="selectedStatus() === 'in_progress'" (click)="selectedStatus.set('in_progress')">In Progress</button>
          <button [class.active]="selectedStatus() === 'recovery_processing'" (click)="selectedStatus.set('recovery_processing')">Disbursing</button>
          <button [class.active]="selectedStatus() === 'completed'" (click)="selectedStatus.set('completed')">Completed</button>
          <button [class.active]="selectedStatus() === 'documents_required'" (click)="selectedStatus.set('documents_required')">Docs Needed</button>
        </div>
      </div>

      <!-- Cases Table -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Case Number</th>
                <th>Claimant</th>
                <th>Claim Type</th>
                <th>Jurisdiction / Court</th>
                <th>Gross Claim</th>
                <th>Contingency Fee</th>
                <th>Status</th>
                <th>Assigned Agent</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (c of filteredCases(); track c.id) {
                <tr>
                  <td>
                    <a [routerLink]="['/admin/cases', c.id]" class="id-link">{{ c.caseNumber }}</a>
                  </td>
                  <td><strong>{{ c.customerName }}</strong></td>
                  <td>{{ c.claimType }}</td>
                  <td><span class="court-tag">{{ c.filingJurisdiction || 'County Court' }}</span></td>
                  <td class="amount-cell">\${{ c.claimAmount | number:'1.0-0' }}</td>
                  <td>
                    <span class="fee-text">\${{ c.expectedFee | number:'1.0-0' }} ({{ c.feePercentage }}%)</span>
                  </td>
                  <td><crm-status-badge [status]="c.status" /></td>
                  <td>{{ c.assignedAgentName }}</td>
                  <td>
                    <a [routerLink]="['/admin/cases', c.id]" class="btn-view">Details</a>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="9" class="empty">No cases match your filters.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create Case Modal -->
      @if (isCreateModalOpen()) {
        <div class="modal-overlay" (click)="isCreateModalOpen.set(false)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Create Recovery Case</h3>
              <button class="close-btn" (click)="isCreateModalOpen.set(false)">✕</button>
            </div>
            <form (ngSubmit)="submitCreateCase()" class="modal-form">
              <div class="form-group">
                <label>Case Title</label>
                <input type="text" [(ngModel)]="newCase.title" name="title" required placeholder="e.g. Sacramento County Tax Deed Surplus" class="input-ctrl" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Claimant / Customer Name</label>
                  <input type="text" [(ngModel)]="newCase.customerName" name="customerName" required class="input-ctrl" />
                </div>
                <div class="form-group">
                  <label>Claim Category</label>
                  <select [(ngModel)]="newCase.claimType" name="claimType" class="input-ctrl">
                    <option value="Tax Deed Surplus">Tax Deed Surplus</option>
                    <option value="Mortgage Foreclosure Overage">Mortgage Foreclosure Overage</option>
                    <option value="Unclaimed Property & Escrow">Unclaimed Property & Escrow</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Gross Claim Amount ($)</label>
                  <input type="number" [(ngModel)]="newCase.claimAmount" name="claimAmount" required class="input-ctrl" />
                </div>
                <div class="form-group">
                  <label>Contingency Fee %</label>
                  <input type="number" [(ngModel)]="newCase.feePercentage" name="feePercentage" value="25" class="input-ctrl" />
                </div>
              </div>
              <div class="form-group">
                <label>Court / Filing Jurisdiction</label>
                <input type="text" [(ngModel)]="newCase.filingJurisdiction" name="filingJurisdiction" placeholder="e.g. 11th Judicial Circuit Court" class="input-ctrl" />
              </div>
              <div class="form-actions">
                <button type="button" class="btn-cancel" (click)="isCreateModalOpen.set(false)">Cancel</button>
                <button type="submit" class="btn-save">Open Case</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; h2 { font-size: 1.65rem; color: #0F172A; margin: 0 0 0.25rem 0; } .subtitle { color: #64748B; font-size: 0.925rem; margin: 0; } }
    .btn-create { background: #2563EB; color: #FFFFFF; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 600; font-size: 0.875rem; cursor: pointer; border: none; &:hover { background: #1D4ED8; } }
    .filters-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .search-box { display: flex; align-items: center; gap: 0.65rem; background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 8px; padding: 0.5rem 0.85rem; flex: 1; max-width: 440px; color: #64748B; }
    .search-input { border: none; background: transparent; outline: none; font-size: 0.875rem; width: 100%; color: #0F172A; }
    .status-filters { display: flex; gap: 0.4rem; flex-wrap: wrap; button { padding: 0.45rem 0.85rem; border-radius: 6px; font-size: 0.8125rem; font-weight: 600; color: #64748B; background: none; border: 1px solid transparent; cursor: pointer; &.active { background: #EFF6FF; color: #2563EB; border-color: #BFDBFE; } } }
    .table-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; th { padding: 0.75rem 0.85rem; color: #64748B; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; border-bottom: 1px solid #E2E8F0; text-align: left; } td { padding: 0.85rem; border-bottom: 1px solid #F1F5F9; color: #334155; } }
    .id-link { font-family: monospace; font-weight: 700; color: #2563EB; text-decoration: none; }
    .court-tag { font-size: 0.8125rem; color: #475569; }
    .amount-cell { font-weight: 700; color: #0F172A; }
    .fee-text { color: #059669; font-weight: 600; font-size: 0.8125rem; }
    .btn-view { padding: 0.3rem 0.75rem; background: #F1F5F9; color: #0F172A; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-decoration: none; &:hover { background: #E2E8F0; } }
    .empty { text-align: center; padding: 3rem; color: #94A3B8; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 1050; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .modal-card { background: #FFF; border-radius: 16px; width: 100%; max-width: 520px; overflow: hidden; }
    .modal-header { padding: 1.25rem 1.5rem; background: #0F172A; color: #FFF; display: flex; justify-content: space-between; align-items: center; h3 { margin: 0; color: #FFF; } .close-btn { background: none; border: none; color: #94A3B8; font-size: 1.25rem; cursor: pointer; } }
    .modal-form { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; label { font-size: 0.8125rem; font-weight: 600; color: #475569; } }
    .input-ctrl { padding: 0.65rem 0.85rem; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 0.875rem; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }
    .btn-cancel { padding: 0.65rem 1.25rem; border: 1px solid #CBD5E1; background: #FFF; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-save { padding: 0.65rem 1.25rem; background: #2563EB; color: #FFF; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
  `]
})
export class AdminCasesComponent {
  private caseService = inject(CrmCaseService);
  private toastService = inject(ToastService);

  searchQuery = '';
  selectedStatus = signal<string>('all');
  allCases = signal<RecoveryCase[]>([]);

  isCreateModalOpen = signal<boolean>(false);
  newCase = {
    title: '',
    customerName: '',
    claimType: 'Tax Deed Surplus',
    claimAmount: 65000,
    feePercentage: 25,
    filingJurisdiction: ''
  };

  constructor() {
    this.caseService.cases$.subscribe(cases => {
      this.allCases.set(cases);
    });
  }

  readonly filteredCases = computed(() => {
    let list = this.allCases();
    const query = this.searchQuery.toLowerCase().trim();
    const status = this.selectedStatus();

    if (status !== 'all') {
      list = list.filter(c => c.status === status);
    }

    if (query) {
      list = list.filter(c =>
        c.caseNumber.toLowerCase().includes(query) ||
        c.customerName.toLowerCase().includes(query) ||
        c.title.toLowerCase().includes(query) ||
        (c.filingJurisdiction && c.filingJurisdiction.toLowerCase().includes(query))
      );
    }
    return list;
  });

  openCreateModal(): void {
    this.newCase = {
      title: '',
      customerName: '',
      claimType: 'Tax Deed Surplus',
      claimAmount: 65000,
      feePercentage: 25,
      filingJurisdiction: ''
    };
    this.isCreateModalOpen.set(true);
  }

  submitCreateCase(): void {
    const fee = Math.round(Number(this.newCase.claimAmount) * (Number(this.newCase.feePercentage) / 100));
    this.caseService.createCase({
      customerId: 'cust-1',
      customerName: this.newCase.customerName,
      title: this.newCase.title,
      claimType: this.newCase.claimType,
      status: 'new',
      priority: 'high',
      claimAmount: Number(this.newCase.claimAmount),
      expectedFee: fee,
      feePercentage: Number(this.newCase.feePercentage),
      recoveredAmount: 0,
      assignedAgentId: 'agent-1',
      assignedAgentName: 'Marcus Vance',
      filingJurisdiction: this.newCase.filingJurisdiction
    }).subscribe(c => {
      this.toastService.success(`Case ${c.caseNumber} created successfully!`);
      this.isCreateModalOpen.set(false);
    });
  }
}
