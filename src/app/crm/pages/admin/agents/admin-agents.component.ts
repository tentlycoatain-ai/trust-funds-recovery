import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentService } from '../../../core/services/agent.service';
import { Agent } from '../../../core/models/agent.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'crm-admin-agents',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Staff & Recovery Specialists</h2>
          <p class="subtitle">Manage specialist case loads, contact metrics, and departmental assignments.</p>
        </div>
        <button class="btn-create" (click)="openCreateModal()">+ Add New Agent</button>
      </div>

      <!-- Agents Grid -->
      <div class="agents-grid">
        @for (agent of agents(); track agent.id) {
          <div class="agent-card">
            <div class="card-header">
              <img [src]="agent.avatar" [alt]="agent.firstName" class="agent-avatar" />
              <div class="header-text">
                <h3>{{ agent.firstName }} {{ agent.lastName }}</h3>
                <span class="role-text">{{ agent.role }}</span>
                <span class="dept-text">{{ agent.department }}</span>
              </div>
              <crm-status-badge [status]="agent.status" />
            </div>

            <div class="contact-info">
              <div class="contact-item">
                <span class="icon">✉</span>
                <span class="val">{{ agent.email }}</span>
              </div>
              <div class="contact-item">
                <span class="icon">📞</span>
                <span class="val">{{ agent.phone }}</span>
              </div>
            </div>

            <div class="stats-row">
              <div class="stat-box">
                <span class="stat-num">{{ agent.activeCases }}</span>
                <span class="stat-lbl">Active Cases</span>
              </div>
              <div class="stat-box">
                <span class="stat-num">{{ agent.completedCases }}</span>
                <span class="stat-lbl">Recovered</span>
              </div>
              <div class="stat-box">
                <span class="stat-num">{{ agent.callsConnected }}</span>
                <span class="stat-lbl">Connected</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Create Agent Modal -->
      @if (isCreateModalOpen()) {
        <div class="modal-overlay" (click)="isCreateModalOpen.set(false)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Onboard Recovery Agent</h3>
              <button class="close-btn" (click)="isCreateModalOpen.set(false)">✕</button>
            </div>
            <form (ngSubmit)="submitCreateAgent()" class="modal-form">
              <div class="form-row">
                <div class="form-group">
                  <label>First Name</label>
                  <input type="text" [(ngModel)]="newAgent.firstName" name="firstName" required class="input-ctrl" />
                </div>
                <div class="form-group">
                  <label>Last Name</label>
                  <input type="text" [(ngModel)]="newAgent.lastName" name="lastName" required class="input-ctrl" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Email Address</label>
                  <input type="email" [(ngModel)]="newAgent.email" name="email" required class="input-ctrl" />
                </div>
                <div class="form-group">
                  <label>Direct Phone</label>
                  <input type="text" [(ngModel)]="newAgent.phone" name="phone" required class="input-ctrl" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Specialist Role</label>
                  <input type="text" [(ngModel)]="newAgent.role" name="role" required class="input-ctrl" />
                </div>
                <div class="form-group">
                  <label>Department</label>
                  <select [(ngModel)]="newAgent.department" name="department" class="input-ctrl">
                    <option value="Tax Foreclosure Recovery">Tax Foreclosure Recovery</option>
                    <option value="Mortgage Surplus Division">Mortgage Surplus Division</option>
                    <option value="Unclaimed Property & Escrow">Unclaimed Property & Escrow</option>
                    <option value="Judicial & Court Filings">Judicial & Court Filings</option>
                  </select>
                </div>
              </div>
              <div class="form-actions">
                <button type="button" class="btn-cancel" (click)="isCreateModalOpen.set(false)">Cancel</button>
                <button type="submit" class="btn-save">Add Agent</button>
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
    .agents-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; }
    .agent-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 1.25rem; }
    .card-header { display: flex; align-items: flex-start; gap: 1rem; }
    .agent-avatar { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; }
    .header-text { flex: 1; h3 { margin: 0; font-size: 1.05rem; color: #0F172A; } .role-text { display: block; font-size: 0.8125rem; color: #2563EB; font-weight: 600; } .dept-text { font-size: 0.75rem; color: #64748B; } }
    .contact-info { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.8125rem; color: #475569; }
    .contact-item { display: flex; align-items: center; gap: 0.5rem; .icon { color: #94A3B8; } }
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; background: #F8FAFC; border-radius: 8px; padding: 0.75rem; text-align: center; }
    .stat-num { display: block; font-size: 1.15rem; font-weight: 700; color: #0F172A; }
    .stat-lbl { font-size: 0.6875rem; color: #64748B; text-transform: uppercase; font-weight: 600; }

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
export class AdminAgentsComponent {
  private agentService = inject(AgentService);
  private toastService = inject(ToastService);

  agents = signal<Agent[]>([]);
  isCreateModalOpen = signal<boolean>(false);

  newAgent = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Recovery Specialist',
    department: 'Mortgage Surplus Division'
  };

  constructor() {
    this.agentService.agents$.subscribe(list => {
      this.agents.set(list);
    });
  }

  openCreateModal(): void {
    this.newAgent = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'Recovery Specialist',
      department: 'Mortgage Surplus Division'
    };
    this.isCreateModalOpen.set(true);
  }

  submitCreateAgent(): void {
    this.agentService.createAgent({
      firstName: this.newAgent.firstName,
      lastName: this.newAgent.lastName,
      email: this.newAgent.email,
      phone: this.newAgent.phone,
      role: this.newAgent.role,
      department: this.newAgent.department,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      dateJoined: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      assignedCustomers: 0,
      activeCases: 0,
      completedCases: 0,
      pendingTasks: 0,
      completedTasks: 0,
      callsMade: 0,
      callsConnected: 0,
      callsMissed: 0
    }).subscribe(a => {
      this.toastService.success(`Agent ${a.firstName} ${a.lastName} onboarded!`);
      this.isCreateModalOpen.set(false);
    });
  }
}
