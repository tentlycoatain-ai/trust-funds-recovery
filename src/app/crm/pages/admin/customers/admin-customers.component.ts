import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer, CustomerStatus } from '../../../core/models/customer.model';
import { PhoneDisplayComponent } from '../../../shared/components/phone-display/phone-display.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { DialerModalComponent } from '../../../shared/components/dialer-modal/dialer-modal.component';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'crm-admin-customers',
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
      <!-- Header -->
      <div class="page-header">
        <div>
          <h2>Customer Directory</h2>
          <p class="subtitle">All client claimants with registered recovery cases and fund disbursements.</p>
        </div>
        <button class="btn-create" (click)="openCreateModal()">
          + Add New Customer
        </button>
      </div>

      <!-- Filters Bar -->
      <div class="filters-card">
        <div class="search-input-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by name, customer ID, or claim type..."
            class="search-input"
          />
        </div>

        <div class="status-tabs">
          <button
            [class.active]="selectedStatus() === 'all'"
            (click)="selectedStatus.set('all')">
            All ({{ (allCustomers() || []).length }})
          </button>
          <button
            [class.active]="selectedStatus() === 'active'"
            (click)="selectedStatus.set('active')">
            Active
          </button>
          <button
            [class.active]="selectedStatus() === 'pending'"
            (click)="selectedStatus.set('pending')">
            Pending
          </button>
          <button
            [class.active]="selectedStatus() === 'resolved'"
            (click)="selectedStatus.set('resolved')">
            Resolved
          </button>
        </div>
      </div>

      <!-- Customers Table -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Full Name</th>
                <th>Protected Phone (Admin Reveal)</th>
                <th>Claim Category</th>
                <th>Claim Amount</th>
                <th>Assigned Agent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (cust of filteredCustomers(); track cust.id) {
                <tr>
                  <td>
                    <a [routerLink]="['/admin/customers', cust.id]" class="id-link">{{ cust.customerNumber }}</a>
                  </td>
                  <td>
                    <div class="name-cell">
                      <strong>{{ cust.fullName }}</strong>
                      <span class="email-sub">{{ cust.email }}</span>
                    </div>
                  </td>
                  <td>
                    <crm-phone-display
                      [phone]="cust.phone"
                      [maskedPhone]="cust.maskedPhone"
                      (dial)="onDialNumber(cust)"
                    />
                  </td>
                  <td>{{ cust.claimType }}</td>
                  <td class="amount-cell">\${{ cust.totalClaimAmount | number:'1.0-0' }}</td>
                  <td>
                    <span class="agent-badge">{{ cust.assignedAgentName }}</span>
                  </td>
                  <td>
                    <crm-status-badge [status]="cust.status" />
                  </td>
                  <td>
                    <div class="action-buttons">
                      <a [routerLink]="['/admin/customers', cust.id]" class="btn-action view">
                        View
                      </a>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="empty-state">
                    No customers found matching the search criteria.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Dialer Modal -->
      <crm-dialer-modal
        [isOpen]="isDialerOpen()"
        [recipientName]="activeDialTarget()?.fullName || ''"
        [recipientPhone]="activeDialTarget()?.phone || ''"
        [recipientMaskedPhone]="activeDialTarget()?.maskedPhone || ''"
        [customerId]="activeDialTarget()?.id"
        (closed)="isDialerOpen.set(false)"
      />

      <!-- Create Customer Modal -->
      @if (isCreateModalOpen()) {
        <div class="modal-overlay" (click)="isCreateModalOpen.set(false)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Create New Customer</h3>
              <button class="close-btn" (click)="isCreateModalOpen.set(false)">✕</button>
            </div>
            <form (ngSubmit)="submitCreateCustomer()" class="modal-form">
              <div class="form-row">
                <div class="form-group">
                  <label>First Name</label>
                  <input type="text" [(ngModel)]="newCust.firstName" name="firstName" required class="input-ctrl" />
                </div>
                <div class="form-group">
                  <label>Last Name</label>
                  <input type="text" [(ngModel)]="newCust.lastName" name="lastName" required class="input-ctrl" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" [(ngModel)]="newCust.email" name="email" required class="input-ctrl" />
                </div>
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="text" [(ngModel)]="newCust.phone" name="phone" placeholder="+1 (555) 000-0000" required class="input-ctrl" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Claim Category</label>
                  <select [(ngModel)]="newCust.claimType" name="claimType" class="input-ctrl">
                    <option value="Tax Deed Surplus">Tax Deed Surplus</option>
                    <option value="Mortgage Foreclosure Overage">Mortgage Foreclosure Overage</option>
                    <option value="Unclaimed Property & Escrow">Unclaimed Property & Escrow</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Total Claim Amount ($)</label>
                  <input type="number" [(ngModel)]="newCust.totalClaimAmount" name="totalClaimAmount" class="input-ctrl" />
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-cancel" (click)="isCreateModalOpen.set(false)">Cancel</button>
                <button type="submit" class="btn-save">Create Customer</button>
              </div>
            </form>
          </div>
        </div>
      }
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
      h2 { font-size: 1.65rem; color: #0F172A; margin-bottom: 0.25rem; }
      .subtitle { color: #64748B; font-size: 0.925rem; margin: 0; }
    }
    .btn-create {
      background: #2563EB;
      color: #FFFFFF;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      border: none;
      cursor: pointer;
      &:hover { background: #1D4ED8; }
    }
    .filters-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .search-input-box {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: #F8FAFC;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 0.5rem 0.85rem;
      flex: 1;
      max-width: 440px;
      color: #64748B;
    }
    .search-input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.875rem;
      width: 100%;
      color: #0F172A;
    }
    .status-tabs {
      display: flex;
      gap: 0.4rem;
      button {
        padding: 0.45rem 0.85rem;
        border-radius: 6px;
        font-size: 0.8125rem;
        font-weight: 600;
        color: #64748B;
        background: none;
        border: 1px solid transparent;
        cursor: pointer;
        &.active {
          background: #EFF6FF;
          color: #2563EB;
          border-color: #BFDBFE;
        }
      }
    }
    .table-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .table-responsive { overflow-x: auto; }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;
      th {
        padding: 0.75rem 0.85rem;
        color: #64748B;
        font-weight: 600;
        font-size: 0.75rem;
        text-transform: uppercase;
        border-bottom: 1px solid #E2E8F0;
        background: #F8FAFC;
      }
      td {
        padding: 0.85rem;
        border-bottom: 1px solid #F1F5F9;
        color: #334155;
      }
    }
    .id-link {
      font-family: monospace;
      font-weight: 700;
      color: #2563EB;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }
    .name-cell {
      display: flex;
      flex-direction: column;
      strong { color: #0F172A; }
      .email-sub { font-size: 0.75rem; color: #64748B; }
    }
    .amount-cell { font-weight: 600; color: #0F172A; }
    .agent-badge {
      background: #F1F5F9;
      color: #334155;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.8125rem;
    }
    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }
    .btn-action {
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      text-decoration: none;
      background: #F1F5F9;
      color: #0F172A;
      &:hover { background: #E2E8F0; }
    }
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #64748B;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1050;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-card {
      background: #FFFFFF;
      border-radius: 16px;
      width: 100%;
      max-width: 520px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }
    .modal-header {
      padding: 1.25rem 1.5rem;
      background: #0F172A;
      color: #FFFFFF;
      display: flex;
      justify-content: space-between;
      align-items: center;
      h3 { margin: 0; font-size: 1.1rem; color: #FFFFFF; }
      .close-btn { background: none; border: none; color: #94A3B8; font-size: 1.25rem; cursor: pointer; &:hover { color: #FFF; } }
    }
    .modal-form {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      label { font-size: 0.8125rem; font-weight: 600; color: #475569; }
    }
    .input-ctrl {
      padding: 0.65rem 0.85rem;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      font-size: 0.875rem;
      &:focus { outline: 2px solid #2563EB; border-color: transparent; }
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .btn-cancel {
      padding: 0.65rem 1.25rem;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-save {
      padding: 0.65rem 1.25rem;
      background: #2563EB;
      color: #FFFFFF;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      &:hover { background: #1D4ED8; }
    }
  `]
})
export class AdminCustomersComponent {
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);

  searchQuery = '';
  selectedStatus = signal<string>('all');
  allCustomers = signal<Customer[]>([]);

  isDialerOpen = signal<boolean>(false);
  activeDialTarget = signal<Customer | null>(null);

  isCreateModalOpen = signal<boolean>(false);
  newCust = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    claimType: 'Tax Deed Surplus',
    totalClaimAmount: 50000
  };

  constructor() {
    this.customerService.customers$.subscribe(customers => {
      this.allCustomers.set(customers);
    });
  }

  readonly filteredCustomers = computed(() => {
    let list = this.allCustomers();
    const query = this.searchQuery.toLowerCase().trim();
    const status = this.selectedStatus();

    if (status !== 'all') {
      list = list.filter(c => c.status === status);
    }

    if (query) {
      list = list.filter(c =>
        c.fullName.toLowerCase().includes(query) ||
        c.customerNumber.toLowerCase().includes(query) ||
        c.claimType.toLowerCase().includes(query) ||
        c.phone.includes(query)
      );
    }
    return list;
  });

  onDialNumber(cust: Customer): void {
    this.activeDialTarget.set(cust);
    this.isDialerOpen.set(true);
  }

  openCreateModal(): void {
    this.newCust = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      claimType: 'Tax Deed Surplus',
      totalClaimAmount: 50000
    };
    this.isCreateModalOpen.set(true);
  }

  submitCreateCustomer(): void {
    this.customerService.createCustomer({
      firstName: this.newCust.firstName,
      lastName: this.newCust.lastName,
      fullName: `${this.newCust.firstName} ${this.newCust.lastName}`,
      email: this.newCust.email,
      phone: this.newCust.phone,
      claimType: this.newCust.claimType,
      status: 'active',
      assignedAgentId: 'agent-1',
      assignedAgentName: 'Marcus Vance',
      totalClaimAmount: Number(this.newCust.totalClaimAmount),
      totalRecoveredAmount: 0,
      activeCasesCount: 1,
      totalCasesCount: 1
    }).subscribe(cust => {
      this.toastService.success(`Customer ${cust.fullName} created successfully!`);
      this.isCreateModalOpen.set(false);
    });
  }
}
