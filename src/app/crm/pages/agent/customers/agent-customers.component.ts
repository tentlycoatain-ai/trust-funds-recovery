import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';
import { PhoneDisplayComponent } from '../../../shared/components/phone-display/phone-display.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { DialerModalComponent } from '../../../shared/components/dialer-modal/dialer-modal.component';

@Component({
  selector: 'crm-agent-customers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PhoneDisplayComponent,
    StatusBadgeComponent,
    DialerModalComponent
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>My Assigned Claimants & Clients</h2>
          <p class="subtitle">Active claimant portfolios under your case management. All direct telephone contact is routed via masked telephony.</p>
        </div>
      </div>

      <!-- Search -->
      <div class="filter-card">
        <input type="text" [(ngModel)]="searchQuery" placeholder="Search by customer name, ID, or claim category..." class="search-ctrl" />
      </div>

      <!-- Customers Table -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Claimant Name</th>
                <th>Masked Telephone (Protected)</th>
                <th>Claim Category</th>
                <th>Total Claim Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (cust of filteredCustomers(); track cust.id) {
                <tr>
                  <td class="font-mono">{{ cust.customerNumber }}</td>
                  <td>
                    <strong>{{ cust.fullName }}</strong>
                    <span class="email-sub">{{ cust.email }}</span>
                  </td>
                  <td>
                    <!-- STRICT: Agent CANNOT reveal raw phone number -->
                    <crm-phone-display
                      [maskedPhone]="cust.maskedPhone"
                      (dial)="dialCustomer(cust)"
                    />
                  </td>
                  <td>{{ cust.claimType }}</td>
                  <td class="font-bold">\${{ cust.totalClaimAmount | number:'1.0-0' }}</td>
                  <td><crm-status-badge [status]="cust.status" /></td>
                  <td>
                    <div class="action-flex">
                      <button class="btn-dial-sm" (click)="dialCustomer(cust)">📞 Call</button>
                      <a [routerLink]="['/agent/customers', cust.id]" class="btn-view-sm">Profile</a>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="empty">No customers found.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Dialer Modal -->
      <crm-dialer-modal
        [isOpen]="isDialerOpen()"
        [recipientName]="activeTarget()?.fullName || 'Claimant'"
        [recipientMaskedPhone]="activeTarget()?.maskedPhone || ''"
        [customerId]="activeTarget()?.id"
        (closed)="isDialerOpen.set(false)"
      />
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header h2 { font-size: 1.65rem; color: #0F172A; margin: 0 0 0.25rem 0; }
    .subtitle { color: #64748B; font-size: 0.925rem; margin: 0; }
    .filter-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 0.75rem 1.25rem; }
    .search-ctrl { width: 100%; max-width: 420px; padding: 0.5rem 0.85rem; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 0.875rem; }
    .table-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; th { padding: 0.75rem; color: #64748B; font-weight: 600; text-align: left; border-bottom: 1px solid #E2E8F0; } td { padding: 0.85rem; border-bottom: 1px solid #F1F5F9; color: #334155; } }
    .font-mono { font-family: monospace; font-weight: 700; color: #059669; }
    .email-sub { display: block; font-size: 0.75rem; color: #64748B; }
    .action-flex { display: flex; gap: 0.5rem; }
    .btn-dial-sm { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; border-radius: 6px; padding: 0.25rem 0.65rem; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
    .btn-view-sm { background: #F1F5F9; color: #0F172A; border-radius: 6px; padding: 0.25rem 0.65rem; font-size: 0.75rem; font-weight: 600; text-decoration: none; }
    .empty { text-align: center; color: #94A3B8; padding: 2rem; }
  `]
})
export class AgentCustomersComponent {
  private customerService = inject(CustomerService);

  searchQuery = '';
  customers = signal<Customer[]>([]);

  isDialerOpen = signal<boolean>(false);
  activeTarget = signal<Customer | null>(null);

  constructor() {
    this.customerService.customers$.subscribe(list => {
      this.customers.set(list);
    });
  }

  readonly filteredCustomers = computed(() => {
    let list = this.customers();
    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(c =>
        c.fullName.toLowerCase().includes(q) ||
        c.customerNumber.toLowerCase().includes(q) ||
        c.claimType.toLowerCase().includes(q)
      );
    }
    return list;
  });

  dialCustomer(cust: Customer): void {
    this.activeTarget.set(cust);
    this.isDialerOpen.set(true);
  }
}
