import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LeadService } from '../../../core/services/lead.service';
import { CustomerService } from '../../../core/services/customer.service';
import { CrmCaseService } from '../../../core/services/case.service';
import { Lead, LeadStage } from '../../../core/models/lead.model';
import { PhoneDisplayComponent } from '../../../shared/components/phone-display/phone-display.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { DialerModalComponent } from '../../../shared/components/dialer-modal/dialer-modal.component';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'crm-admin-leads',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PhoneDisplayComponent,
    StatusBadgeComponent,
    DialerModalComponent
  ],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h2>Leads Pipeline & Overage Opportunities</h2>
          <p class="subtitle">Track identified foreclosure and tax surplus records through intake to signed contract.</p>
        </div>
        <div class="header-actions">
          <div class="view-toggle">
            <button [class.active]="viewMode() === 'kanban'" (click)="viewMode.set('kanban')">Kanban</button>
            <button [class.active]="viewMode() === 'table'" (click)="viewMode.set('table')">Table</button>
          </div>
          <button class="btn-create" (click)="openCreateModal()">+ Add Lead</button>
        </div>
      </div>

      <!-- KANBAN VIEW -->
      @if (viewMode() === 'kanban') {
        <div class="kanban-board">
          @for (col of stages; track col.key) {
            <div class="kanban-col">
              <div class="col-header">
                <div class="col-title-group">
                  <span class="col-title">{{ col.label }}</span>
                  <span class="count-badge">{{ getLeadsByStage(col.key).length }}</span>
                </div>
              </div>

              <div class="col-cards">
                @for (lead of getLeadsByStage(col.key); track lead.id) {
                  <div class="lead-card">
                    <div class="card-top">
                      <span class="lead-id">{{ lead.leadNumber }}</span>
                      <span class="score-pill" [class.high]="lead.score >= 80">Score: {{ lead.score }}</span>
                    </div>

                    <h4 class="lead-name">{{ lead.fullName }}</h4>
                    <p class="property-line">{{ lead.propertyAddress || lead.county + ', ' + lead.state }}</p>

                    <div class="overage-box">
                      <span class="ov-label">Est. Surplus Overage</span>
                      <span class="ov-val">\${{ lead.estimatedOverage | number:'1.0-0' }}</span>
                    </div>

                    <div class="card-contact">
                      <crm-phone-display
                        [phone]="lead.phone"
                        [maskedPhone]="lead.maskedPhone"
                        (dial)="dialLead(lead)"
                      />
                    </div>

                    <div class="card-footer">
                      <span class="agent-name">{{ lead.assignedAgentName || 'Unassigned' }}</span>

                      @if (lead.stage === 'contract_signed') {
                        <button class="btn-convert" (click)="convertLead(lead)">
                          Convert to Client →
                        </button>
                      } @else {
                        <button class="btn-advance" (click)="advanceStage(lead)" title="Advance to next pipeline stage">
                          Advance →
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- TABLE VIEW -->
      @if (viewMode() === 'table') {
        <div class="table-card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Lead #</th>
                  <th>Name</th>
                  <th>Protected Phone</th>
                  <th>Jurisdiction</th>
                  <th>Est. Overage</th>
                  <th>Lead Score</th>
                  <th>Stage</th>
                  <th>Agent</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (lead of allLeads(); track lead.id) {
                  <tr>
                    <td class="font-mono">{{ lead.leadNumber }}</td>
                    <td><strong>{{ lead.fullName }}</strong></td>
                    <td>
                      <crm-phone-display
                        [phone]="lead.phone"
                        [maskedPhone]="lead.maskedPhone"
                        (dial)="dialLead(lead)"
                      />
                    </td>
                    <td>{{ lead.county || 'County' }}, {{ lead.state }}</td>
                    <td class="font-bold">\${{ lead.estimatedOverage | number:'1.0-0' }}</td>
                    <td>
                      <span class="score-pill" [class.high]="lead.score >= 80">{{ lead.score }}</span>
                    </td>
                    <td><crm-status-badge [status]="lead.stage" /></td>
                    <td>{{ lead.assignedAgentName }}</td>
                    <td>
                      @if (lead.stage === 'contract_signed') {
                        <button class="btn-convert-sm" (click)="convertLead(lead)">Convert</button>
                      } @else {
                        <button class="btn-advance-sm" (click)="advanceStage(lead)">Advance</button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Create Lead Modal -->
      @if (isCreateModalOpen()) {
        <div class="modal-overlay" (click)="isCreateModalOpen.set(false)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Create New Lead</h3>
              <button class="close-btn" (click)="isCreateModalOpen.set(false)">✕</button>
            </div>
            <form (ngSubmit)="submitCreateLead()" class="modal-form">
              <div class="form-row">
                <div class="form-group">
                  <label>First Name</label>
                  <input type="text" [(ngModel)]="newLead.firstName" name="firstName" required class="input-ctrl" />
                </div>
                <div class="form-group">
                  <label>Last Name</label>
                  <input type="text" [(ngModel)]="newLead.lastName" name="lastName" required class="input-ctrl" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" [(ngModel)]="newLead.email" name="email" required class="input-ctrl" />
                </div>
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="text" [(ngModel)]="newLead.phone" name="phone" placeholder="+1 (555) 000-0000" required class="input-ctrl" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>State</label>
                  <input type="text" [(ngModel)]="newLead.state" name="state" placeholder="CA, FL, TX..." class="input-ctrl" />
                </div>
                <div class="form-group">
                  <label>County</label>
                  <input type="text" [(ngModel)]="newLead.county" name="county" class="input-ctrl" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Surplus Type</label>
                  <select [(ngModel)]="newLead.surplusType" name="surplusType" class="input-ctrl">
                    <option value="Mortgage Foreclosure">Mortgage Foreclosure</option>
                    <option value="Tax Deed Surplus">Tax Deed Surplus</option>
                    <option value="Unclaimed Estate">Unclaimed Estate</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Estimated Overage ($)</label>
                  <input type="number" [(ngModel)]="newLead.estimatedOverage" name="estimatedOverage" class="input-ctrl" />
                </div>
              </div>
              <div class="form-actions">
                <button type="button" class="btn-cancel" (click)="isCreateModalOpen.set(false)">Cancel</button>
                <button type="submit" class="btn-save">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Quick Dialer Modal -->
      <crm-dialer-modal
        [isOpen]="isDialerOpen()"
        [recipientName]="activeDialTarget()?.fullName || ''"
        [recipientPhone]="activeDialTarget()?.phone || ''"
        [recipientMaskedPhone]="activeDialTarget()?.maskedPhone || ''"
        [leadId]="activeDialTarget()?.id"
        (closed)="isDialerOpen.set(false)"
      />
    </div>
  `,
  styles: [`
    .page-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      h2 { font-size: 1.65rem; color: #0F172A; margin: 0 0 0.25rem 0; }
      .subtitle { color: #64748B; font-size: 0.925rem; margin: 0; }
    }
    .header-actions { display: flex; align-items: center; gap: 0.75rem; }
    .view-toggle {
      display: flex;
      background: #E2E8F0;
      border-radius: 8px;
      padding: 2px;
      button {
        padding: 0.4rem 0.85rem;
        border-radius: 6px;
        font-size: 0.8125rem;
        font-weight: 600;
        color: #475569;
        cursor: pointer;
        &.active { background: #FFFFFF; color: #0F172A; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      }
    }
    .btn-create {
      background: #2563EB;
      color: #FFFFFF;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      &:hover { background: #1D4ED8; }
    }

    /* Kanban Board */
    .kanban-board {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1.25rem;
      overflow-x: auto;
      padding-bottom: 1rem;

      @media (max-width: 1200px) {
        grid-template-columns: repeat(5, minmax(280px, 1fr));
      }
    }
    .kanban-col {
      background: #F1F5F9;
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-height: 500px;
    }
    .col-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .col-title-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .col-title {
      font-weight: 700;
      font-size: 0.875rem;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .count-badge {
      background: #E2E8F0;
      color: #0F172A;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 9999px;
    }
    .col-cards {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .lead-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      transition: transform 150ms ease;
      &:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.06); }
    }
    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .lead-id { font-family: monospace; font-size: 0.75rem; font-weight: 700; color: #64748B; }
    .score-pill {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      background: #F1F5F9;
      color: #475569;
      &.high { background: #DCFCE7; color: #15803D; }
    }
    .lead-name { margin: 0; font-size: 1rem; color: #0F172A; }
    .property-line { margin: 0; font-size: 0.75rem; color: #64748B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .overage-box {
      background: #EFF6FF;
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
      display: flex;
      flex-direction: column;
      .ov-label { font-size: 0.6875rem; color: #3B82F6; text-transform: uppercase; font-weight: 600; }
      .ov-val { font-size: 1.1rem; font-weight: 700; color: #1E40AF; }
    }
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #F1F5F9;
      padding-top: 0.5rem;
      margin-top: 0.25rem;
    }
    .agent-name { font-size: 0.75rem; color: #64748B; }
    .btn-advance {
      background: #F1F5F9;
      color: #0F172A;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid #E2E8F0;
      &:hover { background: #E2E8F0; }
    }
    .btn-convert {
      background: #059669;
      color: #FFFFFF;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      &:hover { background: #047857; }
    }

    /* Table styles */
    .table-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 1.25rem;
    }
    .table-responsive { overflow-x: auto; }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
      th { padding: 0.75rem; color: #64748B; font-weight: 600; text-align: left; border-bottom: 1px solid #E2E8F0; }
      td { padding: 0.85rem; border-bottom: 1px solid #F1F5F9; color: #334155; }
    }
    .font-mono { font-family: monospace; font-weight: 700; color: #2563EB; }
    .btn-convert-sm { background: #059669; color: #FFF; font-size: 0.75rem; font-weight: 600; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
    .btn-advance-sm { background: #F1F5F9; color: #0F172A; font-size: 0.75rem; font-weight: 600; padding: 4px 8px; border-radius: 4px; border: 1px solid #CBD5E1; cursor: pointer; }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 1050; display: flex; align-items: center; justify-content: center; padding: 1rem;
    }
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
export class AdminLeadsComponent {
  private leadService = inject(LeadService);
  private customerService = inject(CustomerService);
  private caseService = inject(CrmCaseService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  viewMode = signal<'kanban' | 'table'>('kanban');
  allLeads = signal<Lead[]>([]);

  isDialerOpen = signal<boolean>(false);
  activeDialTarget = signal<Lead | null>(null);

  isCreateModalOpen = signal<boolean>(false);
  newLead = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    state: 'CA',
    county: 'Sacramento',
    surplusType: 'Tax Deed Surplus',
    estimatedOverage: 75000
  };

  readonly stages: { key: LeadStage; label: string }[] = [
    { key: 'new', label: 'New Inquiries' },
    { key: 'contacted', label: 'Contacted' },
    { key: 'interested', label: 'Interested' },
    { key: 'contract_sent', label: 'Contract Sent' },
    { key: 'contract_signed', label: 'Contract Signed' }
  ];

  constructor() {
    this.leadService.leads$.subscribe(leads => {
      this.allLeads.set(leads);
    });
  }

  getLeadsByStage(stage: LeadStage): Lead[] {
    return this.allLeads().filter(l => l.stage === stage);
  }

  advanceStage(lead: Lead): void {
    const stageOrder: LeadStage[] = ['new', 'contacted', 'interested', 'contract_sent', 'contract_signed'];
    const idx = stageOrder.indexOf(lead.stage);
    if (idx !== -1 && idx < stageOrder.length - 1) {
      const nextStage = stageOrder[idx + 1];
      this.leadService.updateStage(lead.id, nextStage).subscribe(() => {
        this.toastService.info(`Lead moved to ${nextStage.replace(/_/g, ' ')}`);
      });
    }
  }

  convertLead(lead: Lead): void {
    // 1. Create Customer
    this.customerService.createCustomer({
      firstName: lead.firstName,
      lastName: lead.lastName,
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      claimType: lead.surplusType,
      status: 'active',
      assignedAgentId: lead.assignedAgentId || 'agent-1',
      assignedAgentName: lead.assignedAgentName || 'Marcus Vance',
      totalClaimAmount: lead.estimatedOverage,
      totalRecoveredAmount: 0,
      activeCasesCount: 1,
      totalCasesCount: 1
    }).subscribe(customer => {
      // 2. Create Initial Case
      this.caseService.createCase({
        customerId: customer.id,
        customerName: customer.fullName,
        title: `${lead.county || lead.state} ${lead.surplusType} Claim`,
        claimType: lead.surplusType,
        status: 'in_progress',
        priority: 'high',
        claimAmount: lead.estimatedOverage,
        expectedFee: Math.round(lead.estimatedOverage * 0.25),
        feePercentage: 25,
        recoveredAmount: 0,
        assignedAgentId: customer.assignedAgentId,
        assignedAgentName: customer.assignedAgentName || 'Marcus Vance',
        filingJurisdiction: `${lead.county || lead.state} Court / Treasurer`
      }).subscribe(() => {
        // 3. Update lead stage to converted
        this.leadService.updateStage(lead.id, 'converted').subscribe();
        this.toastService.success(`Lead successfully converted! Customer ${customer.customerNumber} and Case created.`);
        this.router.navigate(['/admin/customers', customer.id]);
      });
    });
  }

  dialLead(lead: Lead): void {
    this.activeDialTarget.set(lead);
    this.isDialerOpen.set(true);
  }

  openCreateModal(): void {
    this.newLead = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      state: 'CA',
      county: 'Sacramento',
      surplusType: 'Tax Deed Surplus',
      estimatedOverage: 75000
    };
    this.isCreateModalOpen.set(true);
  }

  submitCreateLead(): void {
    this.leadService.createLead({
      firstName: this.newLead.firstName,
      lastName: this.newLead.lastName,
      fullName: `${this.newLead.firstName} ${this.newLead.lastName}`,
      email: this.newLead.email,
      phone: this.newLead.phone,
      state: this.newLead.state,
      county: this.newLead.county,
      surplusType: this.newLead.surplusType,
      estimatedOverage: Number(this.newLead.estimatedOverage),
      stage: 'new',
      status: 'active',
      score: 85,
      source: 'Internal Research',
      assignedAgentId: 'agent-1',
      assignedAgentName: 'Marcus Vance'
    }).subscribe(lead => {
      this.toastService.success(`Lead ${lead.leadNumber} created!`);
      this.isCreateModalOpen.set(false);
    });
  }
}
