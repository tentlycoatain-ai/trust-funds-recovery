import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CrmCaseService } from '../../../core/services/case.service';
import { LeadService } from '../../../core/services/lead.service';
import { TaskService } from '../../../core/services/task.service';
import { CallService } from '../../../core/services/call.service';
import { RecoveryCase } from '../../../core/models/case.model';
import { Lead } from '../../../core/models/lead.model';
import { Task } from '../../../core/models/task.model';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PhoneDisplayComponent } from '../../../shared/components/phone-display/phone-display.component';
import { DialerModalComponent } from '../../../shared/components/dialer-modal/dialer-modal.component';

@Component({
  selector: 'crm-agent-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StatCardComponent,
    StatusBadgeComponent,
    PhoneDisplayComponent,
    DialerModalComponent
  ],
  template: `
    <div class="dashboard-container">
      <!-- Agent Greeting Header -->
      <div class="greeting-header">
        <div>
          <h2>Welcome back, {{ currentUser()?.name || 'Marcus' }}</h2>
          <p class="subtitle">Here is your daily recovery pipeline, urgent court dates, and claimant calls schedule.</p>
        </div>
        <button class="btn-dialer-quick" (click)="isDialerOpen.set(true)">
          <img class="real-icon real-icon-inline" src="/assets/icons/phone-handset.png" alt="" aria-hidden="true" /> Launch Telephony Dialer
        </button>
      </div>

      <!-- Agent Workload KPIs -->
      <div class="stats-grid">
        <crm-stat-card title="My Active Cases" value="12 Cases" trend="4 scheduled hearings" [isPositive]="true" iconColor="blue" />
        <crm-stat-card title="Assigned Claim Value" value="$468,000" trend="In active recovery" [isPositive]="true" iconColor="emerald" />
        <crm-stat-card title="Pending Tasks" value="7 Items" trend="3 due today" [isPositive]="false" iconColor="amber" />
        <crm-stat-card title="Connected Calls" value="215 Calls" trend="68% connection rate" [isPositive]="true" iconColor="purple" />
      </div>

      <!-- Main Layout: Assigned Cases & Today's Priorities -->
      <div class="two-col-grid">
        <!-- Assigned Cases -->
        <div class="card-box">
          <div class="header-flex">
            <h3>My Active Recovery Cases</h3>
            <a routerLink="/agent/cases" class="view-link">View all cases <img class="real-icon real-icon-inline" src="/assets/icons/forward-card.png" alt="" aria-hidden="true" /></a>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Case #</th>
                  <th>Claimant</th>
                  <th>Claim Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (c of myCases(); track c.id) {
                  <tr>
                    <td class="font-mono">{{ c.caseNumber }}</td>
                    <td><strong>{{ c.customerName }}</strong></td>
                    <td>{{ c.claimType }}</td>
                    <td class="font-bold">\${{ c.claimAmount | number:'1.0-0' }}</td>
                    <td><crm-status-badge [status]="c.status" /></td>
                    <td>
                      <a [routerLink]="['/agent/cases']" class="btn-sm">View</a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Today's Tasks & Calls -->
        <div class="card-box">
          <div class="header-flex">
            <h3>My Daily Action Checklist</h3>
            <a routerLink="/agent/tasks" class="view-link">All tasks <img class="real-icon real-icon-inline" src="/assets/icons/forward-card.png" alt="" aria-hidden="true" /></a>
          </div>

          <div class="tasks-list">
            @for (t of myTasks(); track t.id) {
              <div class="task-card" [class.completed]="t.status === 'completed'">
                <div class="task-chk" (click)="toggleTask(t.id)">
                  @if (t.status === 'completed') { <img class="real-icon real-icon-inline" src="/assets/icons/verified-stamp.png" alt="" aria-hidden="true" /> }
                </div>
                <div class="task-info">
                  <span class="task-title">{{ t.title }}</span>
                  <div class="task-meta">
                    <crm-status-badge [status]="t.priority" />
                    <span class="due-text">Due: {{ t.dueDate | date:'mediumDate' }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Quick Leads Opportunities -->
      <div class="card-box">
        <div class="header-flex">
          <h3>High Priority Leads to Contact</h3>
          <a routerLink="/agent/leads" class="view-link">All Leads <img class="real-icon real-icon-inline" src="/assets/icons/forward-card.png" alt="" aria-hidden="true" /></a>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Lead #</th>
                <th>Candidate Name</th>
                <th>Protected Phone (Agent Masked)</th>
                <th>State / County</th>
                <th>Est. Surplus</th>
                <th>Score</th>
                <th>Stage</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (lead of myLeads(); track lead.id) {
                <tr>
                  <td class="font-mono">{{ lead.leadNumber }}</td>
                  <td><strong>{{ lead.fullName }}</strong></td>
                  <td>
                    <!-- STRICT MASKING ENFORCED: Agent never sees raw phone number -->
                    <crm-phone-display
                      [maskedPhone]="lead.maskedPhone"
                      (dial)="dialLead(lead)"
                    />
                  </td>
                  <td>{{ lead.county || 'County' }}, {{ lead.state }}</td>
                  <td class="font-bold text-green">\${{ lead.estimatedOverage | number:'1.0-0' }}</td>
                  <td>
                    <span class="score-badge">{{ lead.score }}</span>
                  </td>
                  <td><crm-status-badge [status]="lead.stage" /></td>
                  <td>
                    <button class="btn-call-sm" (click)="dialLead(lead)">
                      <img class="real-icon real-icon-inline" src="/assets/icons/phone-handset.png" alt="" aria-hidden="true" /> Call
                    </button>
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
        [recipientName]="dialTarget()?.name || 'Contact'"
        [recipientMaskedPhone]="dialTarget()?.maskedPhone || ''"
        (closed)="isDialerOpen.set(false)"
      />
    </div>
  `,
  styles: [`
    .dashboard-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .greeting-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; h2 { margin: 0 0 0.25rem 0; font-size: 1.65rem; color: #0F172A; } .subtitle { color: #64748B; font-size: 0.925rem; margin: 0; } }
    .btn-dialer-quick { background: #059669; color: #FFF; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; &:hover { background: #047857; } }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; }
    .two-col-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 1.25rem; @media (max-width: 1024px) { grid-template-columns: 1fr; } }
    .card-box { background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; h3 { margin: 0; font-size: 1.05rem; color: #0F172A; } }
    .view-link { font-size: 0.8125rem; color: #059669; font-weight: 600; text-decoration: none; }
    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; th { padding: 0.75rem; color: #64748B; font-weight: 600; text-align: left; border-bottom: 1px solid #E2E8F0; } td { padding: 0.85rem; border-bottom: 1px solid #F1F5F9; color: #334155; } }
    .font-mono { font-family: monospace; font-weight: 700; color: #059669; }
    .text-green { color: #059669; }
    .btn-sm { padding: 0.25rem 0.65rem; background: #F1F5F9; border-radius: 6px; font-size: 0.75rem; color: #0F172A; text-decoration: none; }
    .btn-call-sm { padding: 0.25rem 0.65rem; background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
    .score-badge { font-weight: 700; color: #059669; background: #ECFDF5; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; }
    .tasks-list { display: flex; flex-direction: column; gap: 0.65rem; }
    .task-card { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.65rem; border: 1px solid #F1F5F9; background: #F8FAFC; border-radius: 8px; &.completed { opacity: 0.6; .task-title { text-decoration: line-through; } } }
    .task-chk { width: 18px; height: 18px; border: 2px solid #CBD5E1; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; color: #059669; flex-shrink: 0; }
    .task-info { display: flex; flex-direction: column; gap: 2px; }
    .task-title { font-size: 0.8125rem; font-weight: 600; color: #0F172A; }
    .task-meta { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #64748B; }
  `]
})
export class AgentDashboardComponent {
  private authService = inject(AuthService);
  private caseService = inject(CrmCaseService);
  private leadService = inject(LeadService);
  private taskService = inject(TaskService);

  readonly currentUser = this.authService.currentUser;

  myCases = signal<RecoveryCase[]>([]);
  myTasks = signal<Task[]>([]);
  myLeads = signal<Lead[]>([]);

  isDialerOpen = signal<boolean>(false);
  dialTarget = signal<{ name: string; maskedPhone: string } | null>(null);

  constructor() {
    this.caseService.cases$.subscribe(cases => this.myCases.set(cases.slice(0, 4)));
    this.taskService.tasks$.subscribe(tasks => this.myTasks.set(tasks.slice(0, 5)));
    this.leadService.leads$.subscribe(leads => this.myLeads.set(leads.slice(0, 5)));
  }

  toggleTask(id: string): void {
    this.taskService.toggleComplete(id).subscribe();
  }

  dialLead(lead: Lead): void {
    this.dialTarget.set({ name: lead.fullName, maskedPhone: lead.maskedPhone });
    this.isDialerOpen.set(true);
  }
}
