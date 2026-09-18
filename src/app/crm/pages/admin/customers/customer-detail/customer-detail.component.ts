import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CustomerService } from '../../../../core/services/customer.service';
import { CrmCaseService } from '../../../../core/services/case.service';
import { DocumentService } from '../../../../core/services/document.service';
import { CallService } from '../../../../core/services/call.service';
import { Customer } from '../../../../core/models/customer.model';
import { RecoveryCase } from '../../../../core/models/case.model';
import { CrmDocument } from '../../../../core/models/document.model';
import { Call } from '../../../../core/models/call.model';
import { PhoneDisplayComponent } from '../../../../shared/components/phone-display/phone-display.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { DialerModalComponent } from '../../../../shared/components/dialer-modal/dialer-modal.component';

@Component({
  selector: 'crm-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PhoneDisplayComponent,
    StatusBadgeComponent,
    DialerModalComponent
  ],
  template: `
    @if (customer(); as cust) {
      <div class="detail-container">
        <!-- Top Navigation / Breadcrumb -->
        <div class="breadcrumb">
          <a routerLink="/admin/customers">← Back to Customers</a>
          <span class="sep">/</span>
          <span>{{ cust.customerNumber }}</span>
        </div>

        <!-- Hero Header -->
        <div class="hero-card">
          <div class="hero-left">
            <div class="avatar-initials">
              {{ cust.firstName[0] }}{{ cust.lastName[0] }}
            </div>
            <div>
              <div class="name-status">
                <h2>{{ cust.fullName }}</h2>
                <crm-status-badge [status]="cust.status" />
              </div>
              <div class="meta-row">
                <span class="meta-item">
                  <strong>ID:</strong> {{ cust.customerNumber }}
                </span>
                <span class="meta-item">
                  <strong>Email:</strong> {{ cust.email }}
                </span>
                <span class="meta-item">
                  <strong>Phone:</strong>
                  <crm-phone-display
                    [phone]="cust.phone"
                    [maskedPhone]="cust.maskedPhone"
                    (dial)="isDialerOpen.set(true)"
                  />
                </span>
                <span class="meta-item">
                  <strong>Agent:</strong> {{ cust.assignedAgentName }}
                </span>
              </div>
            </div>
          </div>

          <div class="hero-right">
            <div class="stat-pill">
              <span class="label">Total Claim</span>
              <span class="val">\${{ cust.totalClaimAmount | number:'1.0-0' }}</span>
            </div>
            <div class="stat-pill highlight">
              <span class="label">Recovered</span>
              <span class="val">\${{ cust.totalRecoveredAmount | number:'1.0-0' }}</span>
            </div>
            <button class="btn-call-hero" (click)="isDialerOpen.set(true)">
              📞 Initiate Call
            </button>
          </div>
        </div>

        <!-- Detail Tabs Navigation -->
        <div class="tabs-nav">
          <button [class.active]="activeTab() === 'cases'" (click)="activeTab.set('cases')">
            Recovery Cases ({{ cases().length }})
          </button>
          <button [class.active]="activeTab() === 'documents'" (click)="activeTab.set('documents')">
            Documents ({{ documents().length }})
          </button>
          <button [class.active]="activeTab() === 'calls'" (click)="activeTab.set('calls')">
            Call Logs & History ({{ calls().length }})
          </button>
          <button [class.active]="activeTab() === 'notes'" (click)="activeTab.set('notes')">
            Case Notes & Overview
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content-area">
          <!-- Cases Tab -->
          @if (activeTab() === 'cases') {
            <div class="content-card">
              <h3>Associated Recovery Cases</h3>
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Case #</th>
                      <th>Title</th>
                      <th>Claim Type</th>
                      <th>Claim Amount</th>
                      <th>Contingency Fee</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (c of cases(); track c.id) {
                      <tr>
                        <td>
                          <a [routerLink]="['/admin/cases', c.id]" class="id-link">{{ c.caseNumber }}</a>
                        </td>
                        <td><strong>{{ c.title }}</strong></td>
                        <td>{{ c.claimType }}</td>
                        <td class="font-bold">\${{ c.claimAmount | number:'1.0-0' }}</td>
                        <td>\${{ c.expectedFee | number:'1.0-0' }} ({{ c.feePercentage }}%)</td>
                        <td><crm-status-badge [status]="c.status" /></td>
                        <td>
                          <a [routerLink]="['/admin/cases', c.id]" class="btn-sm-view">View Case</a>
                        </td>
                      </tr>
                    } @empty {
                      <tr><td colspan="7" class="empty">No cases found for this customer.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- Documents Tab -->
          @if (activeTab() === 'documents') {
            <div class="content-card">
              <h3>Case Files & Legal Filings</h3>
              <div class="docs-grid">
                @for (doc of documents(); track doc.id) {
                  <div class="doc-card">
                    <div class="doc-icon">📄</div>
                    <div class="doc-info">
                      <strong>{{ doc.title }}</strong>
                      <span class="file-name">{{ doc.fileName }} ({{ doc.fileSize }})</span>
                      <div class="doc-meta">
                        <crm-status-badge [status]="doc.status" />
                        <span class="date">{{ doc.uploadDate | date:'mediumDate' }}</span>
                      </div>
                    </div>
                    <button class="btn-download" title="Download Document">⬇</button>
                  </div>
                } @empty {
                  <div class="empty">No documents uploaded yet.</div>
                }
              </div>
            </div>
          }

          <!-- Calls Tab -->
          @if (activeTab() === 'calls') {
            <div class="content-card">
              <h3>Telephony Call Activity</h3>
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Date / Time</th>
                      <th>Direction</th>
                      <th>Duration</th>
                      <th>Outcome</th>
                      <th>Agent</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (call of calls(); track call.id) {
                      <tr>
                        <td>{{ call.timestamp | date:'short' }}</td>
                        <td><span class="dir-tag" [ngClass]="call.direction">{{ call.direction }}</span></td>
                        <td>{{ call.durationSeconds }}s</td>
                        <td><crm-status-badge [status]="call.outcome" /></td>
                        <td>{{ call.agentName }}</td>
                        <td>{{ call.notes || '—' }}</td>
                      </tr>
                    } @empty {
                      <tr><td colspan="6" class="empty">No call records for this claimant.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- Notes Tab -->
          @if (activeTab() === 'notes') {
            <div class="content-card notes-view">
              <h3>Claim Notes & History</h3>
              <div class="notes-body">
                <p>{{ cust.notes || 'No general notes available.' }}</p>
                <div class="address-box">
                  <h4>Address on Record</h4>
                  <p>
                    {{ cust.address?.street }}<br/>
                    {{ cust.address?.city }}, {{ cust.address?.state }} {{ cust.address?.postalCode }}<br/>
                    {{ cust.address?.country }}
                  </p>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Quick Dialer Modal -->
        <crm-dialer-modal
          [isOpen]="isDialerOpen()"
          [recipientName]="cust.fullName"
          [recipientPhone]="cust.phone"
          [recipientMaskedPhone]="cust.maskedPhone"
          [customerId]="cust.id"
          (closed)="isDialerOpen.set(false)"
        />
      </div>
    } @else {
      <div class="not-found">
        <h3>Customer Not Found</h3>
        <a routerLink="/admin/customers">Return to Customers Directory</a>
      </div>
    }
  `,
  styles: [`
    .detail-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .breadcrumb {
      font-size: 0.875rem;
      color: #64748B;
      display: flex;
      gap: 0.5rem;
      a { color: #2563EB; text-decoration: none; &:hover { text-decoration: underline; } }
      .sep { color: #CBD5E1; }
    }
    .hero-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 1.75rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .hero-left {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .avatar-initials {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #2563EB, #1E3A8A);
      color: #FFFFFF;
      font-size: 1.5rem;
      font-weight: 700;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .name-status {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
      h2 { margin: 0; font-size: 1.6rem; color: #0F172A; }
    }
    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
      font-size: 0.875rem;
      color: #475569;
    }
    .hero-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .stat-pill {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 0.65rem 1.25rem;
      display: flex;
      flex-direction: column;
      .label { font-size: 0.75rem; color: #64748B; text-transform: uppercase; font-weight: 600; }
      .val { font-size: 1.25rem; font-weight: 700; color: #0F172A; }
      &.highlight {
        background: #ECFDF5;
        border-color: #A7F3D0;
        .val { color: #059669; }
      }
    }
    .btn-call-hero {
      background: #16A34A;
      color: #FFFFFF;
      font-weight: 600;
      padding: 0.85rem 1.4rem;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
      &:hover { background: #15803D; }
    }
    .tabs-nav {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid #E2E8F0;
      button {
        padding: 0.75rem 1.25rem;
        background: none;
        border: none;
        font-size: 0.9rem;
        font-weight: 600;
        color: #64748B;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        &.active {
          color: #2563EB;
          border-bottom-color: #2563EB;
        }
      }
    }
    .content-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 1.5rem;
      h3 { margin: 0 0 1.25rem 0; font-size: 1.15rem; color: #0F172A; }
    }
    .table-responsive { overflow-x: auto; }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
      th { padding: 0.75rem; color: #64748B; font-weight: 600; text-align: left; border-bottom: 1px solid #E2E8F0; }
      td { padding: 0.75rem; border-bottom: 1px solid #F1F5F9; color: #334155; }
    }
    .id-link { color: #2563EB; font-family: monospace; font-weight: 700; text-decoration: none; }
    .btn-sm-view {
      padding: 0.25rem 0.65rem;
      background: #F1F5F9;
      border-radius: 6px;
      color: #0F172A;
      font-size: 0.75rem;
      font-weight: 600;
      text-decoration: none;
      &:hover { background: #E2E8F0; }
    }
    .docs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }
    .doc-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .doc-icon { font-size: 1.75rem; }
    .doc-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      .file-name { font-size: 0.75rem; color: #64748B; }
      .doc-meta { display: flex; gap: 0.5rem; align-items: center; margin-top: 4px; }
      .date { font-size: 0.7rem; color: #94A3B8; }
    }
    .btn-download {
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 6px 10px;
      cursor: pointer;
      &:hover { background: #F1F5F9; }
    }
    .dir-tag {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
      &.outbound { background: #EFF6FF; color: #1D4ED8; }
      &.inbound { background: #ECFDF5; color: #047857; }
    }
    .address-box {
      margin-top: 1.5rem;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 1rem;
      h4 { margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #0F172A; }
      p { margin: 0; color: #475569; font-size: 0.875rem; line-height: 1.5; }
    }
    .empty { text-align: center; color: #94A3B8; padding: 2rem; }
    .not-found { text-align: center; padding: 4rem; }
  `]
})
export class CustomerDetailComponent {
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);
  private caseService = inject(CrmCaseService);
  private docService = inject(DocumentService);
  private callService = inject(CallService);

  customer = signal<Customer | null>(null);
  cases = signal<RecoveryCase[]>([]);
  documents = signal<CrmDocument[]>([]);
  calls = signal<Call[]>([]);

  activeTab = signal<'cases' | 'documents' | 'calls' | 'notes'>('cases');
  isDialerOpen = signal<boolean>(false);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.customerService.getCustomerById(id).subscribe(cust => {
          if (cust) {
            this.customer.set(cust);
            this.caseService.getCasesByCustomer(cust.id).subscribe(cases => this.cases.set(cases));
            this.docService.getDocumentsByCustomer(cust.id).subscribe(docs => this.documents.set(docs));
            this.callService.getCallsByCustomer(cust.id).subscribe(calls => this.calls.set(calls));
          }
        });
      }
    });
  }
}
