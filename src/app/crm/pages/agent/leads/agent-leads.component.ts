import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeadService } from '../../../core/services/lead.service';
import { Lead, LeadStage } from '../../../core/models/lead.model';
import { PhoneDisplayComponent } from '../../../shared/components/phone-display/phone-display.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { DialerModalComponent } from '../../../shared/components/dialer-modal/dialer-modal.component';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'crm-agent-leads',
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
      <div class="page-header">
        <div>
          <h2>My Assigned Leads & Prospects</h2>
          <p class="subtitle">Direct contact pipeline for identified overages. Connect with potential claimants via verified telephony bridge.</p>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="filters-card">
        <div class="search-box">
          <input type="text" [(ngModel)]="searchQuery" placeholder="Filter by lead name, location, surplus type..." class="search-input" />
        </div>
        <div class="stage-tabs">
          <button [class.active]="selectedStage() === 'all'" (click)="selectedStage.set('all')">All Leads</button>
          <button [class.active]="selectedStage() === 'new'" (click)="selectedStage.set('new')">New</button>
          <button [class.active]="selectedStage() === 'contacted'" (click)="selectedStage.set('contacted')">Contacted</button>
          <button [class.active]="selectedStage() === 'interested'" (click)="selectedStage.set('interested')">Interested</button>
          <button [class.active]="selectedStage() === 'contract_sent'" (click)="selectedStage.set('contract_sent')">Contract Sent</button>
        </div>
      </div>

      <!-- Leads Grid -->
      <div class="leads-grid">
        @for (lead of filteredLeads(); track lead.id) {
          <div class="lead-card">
            <div class="card-header">
              <span class="lead-id">{{ lead.leadNumber }}</span>
              <crm-status-badge [status]="lead.stage" />
            </div>

            <h3 class="lead-name">{{ lead.fullName }}</h3>
            <span class="location-tag">📍 {{ lead.county || 'County' }}, {{ lead.state }}</span>

            <div class="overage-stat">
              <span class="lbl">Est. Surplus Overage</span>
              <span class="val">\${{ lead.estimatedOverage | number:'1.0-0' }}</span>
              <span class="type-sub">{{ lead.surplusType }}</span>
            </div>

            <div class="contact-box">
              <span class="contact-lbl">Claimant Phone (Masked for Privacy):</span>
              <!-- Strictly masked: Agent CANNOT reveal raw phone number -->
              <crm-phone-display
                [maskedPhone]="lead.maskedPhone"
                (dial)="dialLead(lead)"
              />
            </div>

            @if (lead.notes) {
              <div class="notes-preview">
                <p>{{ lead.notes }}</p>
              </div>
            }

            <div class="card-actions">
              <button class="btn-dial" (click)="dialLead(lead)">
                <img class="real-icon real-icon-inline" src="/assets/icons/phone-handset.png" alt="" aria-hidden="true" /> Connect Call
              </button>
              <button class="btn-advance" (click)="advanceLead(lead)">
                Advance Stage <img class="real-icon real-icon-inline" src="/assets/icons/forward-card.png" alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
        } @empty {
          <div class="empty">No leads found in this filter.</div>
        }
      </div>

      <!-- Quick Dialer Modal -->
      <crm-dialer-modal
        [isOpen]="isDialerOpen()"
        [recipientName]="activeTarget()?.fullName || 'Contact'"
        [recipientMaskedPhone]="activeTarget()?.maskedPhone || ''"
        [leadId]="activeTarget()?.id"
        (closed)="isDialerOpen.set(false)"
      />
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header h2 { font-size: 1.65rem; color: #0F172A; margin: 0 0 0.25rem 0; }
    .subtitle { color: #64748B; font-size: 0.925rem; margin: 0; }
    .filters-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .search-box { flex: 1; max-width: 380px; }
    .search-input { width: 100%; padding: 0.5rem 0.85rem; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 0.875rem; }
    .stage-tabs { display: flex; gap: 0.4rem; flex-wrap: wrap; button { padding: 0.45rem 0.85rem; border-radius: 6px; font-size: 0.8125rem; font-weight: 600; color: #64748B; cursor: pointer; &.active { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; } } }
    .leads-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; }
    .lead-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .card-header { display: flex; justify-content: space-between; align-items: center; }
    .lead-id { font-family: monospace; font-size: 0.75rem; font-weight: 700; color: #64748B; }
    .lead-name { margin: 0; font-size: 1.15rem; color: #0F172A; }
    .location-tag { font-size: 0.8125rem; color: #64748B; }
    .overage-stat { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 0.65rem 0.85rem; display: flex; flex-direction: column; .lbl { font-size: 0.6875rem; color: #059669; font-weight: 700; text-transform: uppercase; } .val { font-size: 1.25rem; font-weight: 700; color: #047857; } .type-sub { font-size: 0.75rem; color: #059669; } }
    .contact-box { display: flex; flex-direction: column; gap: 4px; .contact-lbl { font-size: 0.75rem; color: #64748B; font-weight: 600; } }
    .notes-preview { background: #F8FAFC; border-radius: 6px; padding: 0.5rem 0.75rem; p { margin: 0; font-size: 0.75rem; color: #475569; } }
    .card-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin-top: auto; padding-top: 0.5rem; }
    .btn-dial { background: #059669; color: #FFF; border: none; border-radius: 6px; padding: 0.55rem; font-size: 0.8125rem; font-weight: 600; cursor: pointer; &:hover { background: #047857; } }
    .btn-advance { background: #F1F5F9; color: #0F172A; border: 1px solid #CBD5E1; border-radius: 6px; padding: 0.55rem; font-size: 0.8125rem; font-weight: 600; cursor: pointer; &:hover { background: #E2E8F0; } }
    .empty { grid-column: 1 / -1; text-align: center; color: #94A3B8; padding: 3rem; }
  `]
})
export class AgentLeadsComponent {
  private leadService = inject(LeadService);
  private toastService = inject(ToastService);

  searchQuery = '';
  selectedStage = signal<string>('all');
  leads = signal<Lead[]>([]);

  isDialerOpen = signal<boolean>(false);
  activeTarget = signal<Lead | null>(null);

  constructor() {
    this.leadService.leads$.subscribe(list => {
      this.leads.set(list);
    });
  }

  readonly filteredLeads = computed(() => {
    let list = this.leads();
    const query = this.searchQuery.toLowerCase().trim();
    const stage = this.selectedStage();

    if (stage !== 'all') {
      list = list.filter(l => l.stage === stage);
    }
    if (query) {
      list = list.filter(l =>
        l.fullName.toLowerCase().includes(query) ||
        l.state.toLowerCase().includes(query) ||
        (l.county && l.county.toLowerCase().includes(query)) ||
        l.surplusType.toLowerCase().includes(query)
      );
    }
    return list;
  });

  dialLead(lead: Lead): void {
    this.activeTarget.set(lead);
    this.isDialerOpen.set(true);
  }

  advanceLead(lead: Lead): void {
    const stageOrder: LeadStage[] = ['new', 'contacted', 'interested', 'contract_sent', 'contract_signed'];
    const idx = stageOrder.indexOf(lead.stage);
    if (idx !== -1 && idx < stageOrder.length - 1) {
      const next = stageOrder[idx + 1];
      this.leadService.updateStage(lead.id, next).subscribe(() => {
        this.toastService.info(`Lead moved to ${next.replace(/_/g, ' ')}`);
      });
    }
  }
}
