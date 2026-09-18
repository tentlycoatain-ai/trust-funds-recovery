import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { CrmCaseService } from '../../../core/services/case.service';
import { AuthService } from '../../../core/auth/auth.service';
import { RecoveryCase, CaseStatus } from '../../../core/models/case.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'crm-agent-cases',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">My Assigned Recovery Cases</h1>
          <p class="page-subtitle">Active legal petitions, surplus claims, and status updates for your assigned claimants</p>
        </div>
        <div class="header-stats">
          <div class="mini-stat">
            <span class="num">{{ activeCasesCount() }}</span>
            <span class="lbl">Active Cases</span>
          </div>
          <div class="mini-stat">
            <span class="num highlight">\${{ totalRecoverable() | number:'1.0-0' }}</span>
            <span class="lbl">Assigned Value</span>
          </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="filters-bar">
        <div class="search-box">
          <img class="real-icon real-icon-inline" src="/assets/icons/coin-stack.png" alt="" aria-hidden="true" />
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search by case #, customer, jurisdiction..." class="search-input" />
        </div>

        <div class="status-tabs">
          <button [class.active]="selectedStatus() === 'all'" (click)="selectedStatus.set('all')">All Cases</button>
          <button [class.active]="selectedStatus() === 'in_progress'" (click)="selectedStatus.set('in_progress')">In Progress</button>
          <button [class.active]="selectedStatus() === 'recovery_processing'" (click)="selectedStatus.set('recovery_processing')">Processing</button>
          <button [class.active]="selectedStatus() === 'documents_required'" (click)="selectedStatus.set('documents_required')">Docs Required</button>
          <button [class.active]="selectedStatus() === 'completed'" (click)="selectedStatus.set('completed')">Completed</button>
        </div>
      </div>

      <!-- Cases Grid / Table -->
      <div class="cases-grid">
        @for (item of filteredCases(); track item.id) {
          <div class="case-card">
            <div class="card-top">
              <div class="case-meta">
                <span class="case-num">{{ item.caseNumber }}</span>
                <span class="priority-pill" [class]="'prio-' + item.priority">{{ item.priority | uppercase }}</span>
              </div>
              <crm-status-badge [status]="item.status" />
            </div>

            <h3 class="case-title">{{ item.title }}</h3>
            <div class="customer-row">
              <img class="real-icon real-icon-inline" src="/assets/icons/coin-stack.png" alt="" aria-hidden="true" />
              <span>{{ item.customerName }}</span>
            </div>

            <div class="jurisdiction-box">
              <span class="j-lbl">Jurisdiction</span>
              <span class="j-val">{{ item.filingJurisdiction || 'Pending County Assignment' }}</span>
              @if (item.caseRefNumber) {
                <span class="docket">Docket: {{ item.caseRefNumber }}</span>
              }
            </div>

            <div class="financials-row">
              <div class="fin-col">
                <span class="fin-lbl">Claim Value</span>
                <span class="fin-val">\${{ item.claimAmount | number:'1.0-0' }}</span>
              </div>
              <div class="fin-col">
                <span class="fin-lbl">Est. Contingency ({{ item.feePercentage }}%)</span>
                <span class="fin-val highlight">\${{ item.expectedFee | number:'1.0-0' }}</span>
              </div>
            </div>

            <div class="card-footer">
              <div class="status-select-wrap">
                <label class="status-lbl">Update Status:</label>
                <select [ngModel]="item.status" (ngModelChange)="onStatusChange(item, $event)" class="status-dropdown">
                  <option value="in_progress">In Progress</option>
                  <option value="documents_required">Documents Required</option>
                  <option value="under_review">Under Review</option>
                  <option value="recovery_processing">Recovery Processing</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <img class="real-icon real-icon-inline" src="/assets/icons/coin-stack.png" alt="" aria-hidden="true" />
            <p>No assigned cases found matching filter.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
    .page-title { font-size: 24px; font-weight: 700; color: var(--crm-text-primary); margin: 0 0 4px; }
    .page-subtitle { font-size: 14px; color: var(--crm-text-secondary); margin: 0; }
    .header-stats { display: flex; gap: 16px; }
    .mini-stat { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 12px; padding: 12px 18px; display: flex; flex-direction: column; align-items: center; }
    .mini-stat .num { font-size: 20px; font-weight: 700; color: var(--crm-text-primary); }
    .mini-stat .num.highlight { color: #16a34a; }
    .mini-stat .lbl { font-size: 11px; color: var(--crm-text-muted); text-transform: uppercase; font-weight: 600; }
    .filters-bar { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .search-box { display: flex; align-items: center; gap: 10px; background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 10px; padding: 10px 14px; }
    .search-input { border: none; background: transparent; outline: none; font-size: 14px; color: var(--crm-text-primary); width: 100%; }
    .status-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
    .status-tabs button { border: 1px solid var(--crm-border); background: var(--crm-surface); color: var(--crm-text-secondary); font-size: 13px; font-weight: 500; padding: 6px 14px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
    .status-tabs button:hover { border-color: var(--crm-accent); color: var(--crm-accent); }
    .status-tabs button.active { background: var(--crm-accent); color: #fff; border-color: var(--crm-accent); }
    .cases-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 18px; }
    .case-card { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 12px; transition: transform 0.15s, box-shadow 0.15s; }
    .case-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
    .card-top { display: flex; justify-content: space-between; align-items: center; }
    .case-meta { display: flex; align-items: center; gap: 8px; }
    .case-num { font-size: 13px; font-weight: 700; color: var(--crm-accent); font-family: monospace; }
    .priority-pill { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
    .prio-urgent { background: #fee2e2; color: #dc2626; }
    .prio-high { background: #ffedd5; color: #ea580c; }
    .prio-medium { background: #eff6ff; color: #2563eb; }
    .prio-low { background: #f3f4f6; color: #6b7280; }
    .case-title { font-size: 15px; font-weight: 600; color: var(--crm-text-primary); margin: 0; }
    .customer-row { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--crm-text-secondary); }
    .jurisdiction-box { background: var(--crm-surface-2); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 2px; }
    .j-lbl { font-size: 10px; font-weight: 600; text-transform: uppercase; color: var(--crm-text-muted); }
    .j-val { font-size: 12px; font-weight: 500; color: var(--crm-text-primary); }
    .docket { font-size: 11px; color: var(--crm-text-muted); font-family: monospace; }
    .financials-row { display: flex; justify-content: space-between; background: rgba(59,130,246,0.04); border-radius: 8px; padding: 10px 14px; border: 1px solid rgba(59,130,246,0.1); }
    .fin-col { display: flex; flex-direction: column; }
    .fin-lbl { font-size: 10px; color: var(--crm-text-muted); text-transform: uppercase; font-weight: 600; }
    .fin-val { font-size: 14px; font-weight: 700; color: var(--crm-text-primary); }
    .fin-val.highlight { color: #16a34a; }
    .card-footer { padding-top: 10px; border-top: 1px solid var(--crm-border); }
    .status-select-wrap { display: flex; align-items: center; justify-content: space-between; }
    .status-lbl { font-size: 12px; font-weight: 500; color: var(--crm-text-secondary); }
    .status-dropdown { font-size: 12px; padding: 5px 8px; border-radius: 6px; border: 1px solid var(--crm-border); background: var(--crm-surface); color: var(--crm-text-primary); }
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--crm-text-muted); }
    .empty-state svg { opacity: 0.4; margin-bottom: 12px; }
  `]
})
export class AgentCasesComponent {
  private caseService = inject(CrmCaseService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  private allCases = toSignal(this.caseService.cases$, { initialValue: [] });

  searchQuery = '';
  selectedStatus = signal<string>('all');

  // Filter cases assigned to current agent or fallback to agent-1
  myCases = computed(() => {
    const agentId = this.authService.currentUser()?.agentId || 'agent-1';
    const list = this.allCases();
    const assigned = list.filter(c => c.assignedAgentId === agentId);
    return assigned.length > 0 ? assigned : list.slice(0, 6); // Fallback for rich display
  });

  filteredCases = computed(() => {
    const status = this.selectedStatus();
    const query = this.searchQuery.toLowerCase().trim();

    return this.myCases().filter(c => {
      const matchesStatus = status === 'all' || c.status === status;
      const matchesQuery = !query || 
        c.caseNumber.toLowerCase().includes(query) ||
        c.customerName.toLowerCase().includes(query) ||
        c.title.toLowerCase().includes(query) ||
        (c.filingJurisdiction && c.filingJurisdiction.toLowerCase().includes(query));

      return matchesStatus && matchesQuery;
    });
  });

  activeCasesCount = computed(() => this.myCases().filter(c => c.status !== 'completed' && c.status !== 'closed').length);
  totalRecoverable = computed(() => this.myCases().reduce((sum, c) => sum + (c.claimAmount || 0), 0));

  onStatusChange(caseItem: RecoveryCase, newStatus: string) {
    this.caseService.updateStatus(caseItem.id, newStatus as CaseStatus).subscribe(() => {
      this.toastService.show(`Case ${caseItem.caseNumber} updated to ${newStatus.replace('_', ' ')}`, 'success');
    });
  }
}
