import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CustomerService } from '../../../../core/services/customer.service';
import { CrmCaseService } from '../../../../core/services/case.service';
import { DocumentService } from '../../../../core/services/document.service';
import { Customer } from '../../../../core/models/customer.model';
import { RecoveryCase } from '../../../../core/models/case.model';
import { CrmDocument } from '../../../../core/models/document.model';
import { PhoneDisplayComponent } from '../../../../shared/components/phone-display/phone-display.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { DialerModalComponent } from '../../../../shared/components/dialer-modal/dialer-modal.component';

@Component({
  selector: 'crm-agent-customer-detail',
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
        <div class="breadcrumb">
          <a routerLink="/agent/customers">← Back to My Customers</a>
          <span class="sep">/</span>
          <span>{{ cust.customerNumber }}</span>
        </div>

        <!-- Profile Hero -->
        <div class="hero-card">
          <div class="hero-left">
            <div class="avatar-box">
              {{ cust.firstName[0] }}{{ cust.lastName[0] }}
            </div>
            <div>
              <div class="name-status">
                <h2>{{ cust.fullName }}</h2>
                <crm-status-badge [status]="cust.status" />
              </div>
              <div class="meta-row">
                <span><strong>Customer #:</strong> {{ cust.customerNumber }}</span>
                <span><strong>Email:</strong> {{ cust.email }}</span>
                <span>
                  <strong>Phone:</strong>
                  <!-- STRICT MASKING: Agent view never displays unmasked phone -->
                  <crm-phone-display [maskedPhone]="cust.maskedPhone" (dial)="isDialerOpen.set(true)" />
                </span>
              </div>
            </div>
          </div>

          <div class="hero-right">
            <div class="stat-badge">
              <span class="lbl">Gross Claim</span>
              <span class="val">\${{ cust.totalClaimAmount | number:'1.0-0' }}</span>
            </div>
            <button class="btn-call" (click)="isDialerOpen.set(true)">
              <img class="real-icon real-icon-inline" src="/assets/icons/phone-handset.png" alt="" aria-hidden="true" /> Call Claimant
            </button>
          </div>
        </div>

        <!-- Cases & Documents -->
        <div class="sections-grid">
          <!-- Cases -->
          <div class="section-card">
            <h3>Assigned Cases</h3>
            <div class="cases-list">
              @for (c of cases(); track c.id) {
                <div class="case-item">
                  <div>
                    <strong class="case-title">{{ c.title }}</strong>
                    <span class="case-num">Docket: {{ c.caseNumber }} • {{ c.claimType }}</span>
                  </div>
                  <div class="case-right">
                    <span class="amt">\${{ c.claimAmount | number:'1.0-0' }}</span>
                    <crm-status-badge [status]="c.status" />
                  </div>
                </div>
              } @empty {
                <div class="empty">No cases found.</div>
              }
            </div>
          </div>

          <!-- Documents -->
          <div class="section-card">
            <h3>Case Documents & Filings</h3>
            <div class="docs-list">
              @for (doc of documents(); track doc.id) {
                <div class="doc-item">
                  <span class="doc-icon"><img class="real-icon real-icon-inline" src="/assets/icons/document-folder.png" alt="" aria-hidden="true" /></span>
                  <div class="doc-info">
                    <strong>{{ doc.title }}</strong>
                    <span class="sub">{{ doc.fileName }}</span>
                  </div>
                  <crm-status-badge [status]="doc.status" />
                </div>
              } @empty {
                <div class="empty">No documents linked.</div>
              }
            </div>
          </div>
        </div>

        <!-- Quick Dialer -->
        <crm-dialer-modal
          [isOpen]="isDialerOpen()"
          [recipientName]="cust.fullName"
          [recipientMaskedPhone]="cust.maskedPhone"
          [customerId]="cust.id"
          (closed)="isDialerOpen.set(false)"
        />
      </div>
    }
  `,
  styles: [`
    .detail-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .breadcrumb { font-size: 0.875rem; color: #64748B; a { color: #059669; text-decoration: none; } .sep { margin: 0 0.5rem; color: #CBD5E1; } }
    .hero-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 1.75rem 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .hero-left { display: flex; align-items: center; gap: 1.25rem; }
    .avatar-box { width: 60px; height: 60px; border-radius: 12px; background: linear-gradient(135deg, #059669, #047857); color: #FFF; font-size: 1.5rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .name-status { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; h2 { margin: 0; font-size: 1.5rem; color: #0F172A; } }
    .meta-row { display: flex; flex-wrap: wrap; gap: 1.25rem; font-size: 0.875rem; color: #475569; }
    .hero-right { display: flex; align-items: center; gap: 1rem; }
    .stat-badge { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 0.55rem 1.25rem; display: flex; flex-direction: column; .lbl { font-size: 0.75rem; color: #059669; font-weight: 600; text-transform: uppercase; } .val { font-size: 1.25rem; font-weight: 700; color: #047857; } }
    .btn-call { background: #059669; color: #FFF; font-weight: 600; padding: 0.85rem 1.4rem; border-radius: 10px; border: none; cursor: pointer; &:hover { background: #047857; } }
    .sections-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; @media (max-width: 900px) { grid-template-columns: 1fr; } }
    .section-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.5rem; h3 { margin: 0 0 1rem 0; font-size: 1.05rem; color: #0F172A; } }
    .cases-list, .docs-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .case-item, .doc-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #F8FAFC; border: 1px solid #F1F5F9; border-radius: 8px; }
    .case-title { font-size: 0.875rem; color: #0F172A; display: block; }
    .case-num { font-size: 0.75rem; color: #64748B; }
    .case-right { display: flex; align-items: center; gap: 0.75rem; .amt { font-weight: 700; color: #0F172A; font-size: 0.9rem; } }
    .doc-icon { font-size: 1.25rem; margin-right: 0.5rem; }
    .doc-info { flex: 1; strong { font-size: 0.8125rem; color: #0F172A; display: block; } .sub { font-size: 0.7rem; color: #64748B; } }
    .empty { text-align: center; color: #94A3B8; padding: 2rem; font-size: 0.8125rem; }
  `]
})
export class AgentCustomerDetailComponent {
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);
  private caseService = inject(CrmCaseService);
  private docService = inject(DocumentService);

  customer = signal<Customer | null>(null);
  cases = signal<RecoveryCase[]>([]);
  documents = signal<CrmDocument[]>([]);
  isDialerOpen = signal<boolean>(false);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.customerService.getCustomerById(id).subscribe(c => {
          if (c) {
            this.customer.set(c);
            this.caseService.getCasesByCustomer(c.id).subscribe(cases => this.cases.set(cases));
            this.docService.getDocumentsByCustomer(c.id).subscribe(docs => this.documents.set(docs));
          }
        });
      }
    });
  }
}
