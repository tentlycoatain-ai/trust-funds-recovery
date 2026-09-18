import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { CrmCaseService } from '../../../core/services/case.service';
import { LeadService } from '../../../core/services/lead.service';
import { CustomerService } from '../../../core/services/customer.service';
import { TaskService } from '../../../core/services/task.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'crm-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BaseChartDirective,
    StatCardComponent,
    StatusBadgeComponent
  ],
  template: `
    <div class="dashboard-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h2>Executive Recovery Dashboard</h2>
          <p class="subtitle">Real-time overview of claims, pipeline conversions, and recovery disbursements.</p>
        </div>
        <div class="header-actions">
          <a routerLink="/admin/cases" class="btn-primary-action">
            + New Claim Case
          </a>
          <a routerLink="/admin/leads" class="btn-secondary-action">
            + Add Lead
          </a>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="stats-grid">
        <crm-stat-card
          title="Total Recovered Funds"
          value="$438,200"
          trend="+18.4% vs last mo"
          [isPositive]="true"
          iconColor="emerald"
        />
        <crm-stat-card
          title="Active Recovery Cases"
          value="15 Cases"
          trend="+3 new this week"
          [isPositive]="true"
          iconColor="blue"
        />
        <crm-stat-card
          title="Pipeline Leads"
          value="24 Leads"
          trend="82% High Conv. Score"
          [isPositive]="true"
          iconColor="amber"
        />
        <crm-stat-card
          title="Earned Contingency Fees"
          value="$109,550"
          trend="25.0% avg fee margin"
          [isPositive]="true"
          iconColor="purple"
        />
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <!-- Monthly Recovery Trend -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Monthly Recovery Volume ($)</h3>
            <span class="chart-tag">FY 2026</span>
          </div>
          <div class="chart-wrapper">
            <canvas
              baseChart
              [data]="barChartData"
              [options]="barChartOptions"
              [type]="barChartType">
            </canvas>
          </div>
        </div>

        <!-- Claim Types Distribution -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Claims by Category</h3>
            <span class="chart-tag">Distribution</span>
          </div>
          <div class="chart-wrapper donut-wrapper">
            <canvas
              baseChart
              [data]="pieChartData"
              [options]="pieChartOptions"
              [type]="pieChartType">
            </canvas>
          </div>
        </div>
      </div>

      <!-- Tables Section -->
      <div class="tables-grid">
        <!-- Recent Active Cases -->
        <div class="table-card">
          <div class="card-header-flex">
            <h3>Recent Recovery Cases</h3>
            <a routerLink="/admin/cases" class="view-all-link">View all cases →</a>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Case #</th>
                  <th>Customer</th>
                  <th>Claim Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Assigned Agent</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (item of cases$ | async; track item.id) {
                  <tr>
                    <td>
                      <a [routerLink]="['/admin/cases', item.id]" class="case-link">{{ item.caseNumber }}</a>
                    </td>
                    <td class="font-medium">{{ item.customerName }}</td>
                    <td>{{ item.claimType }}</td>
                    <td class="amount-cell">\${{ item.claimAmount | number:'1.0-0' }}</td>
                    <td>
                      <crm-status-badge [status]="item.status" />
                    </td>
                    <td>{{ item.assignedAgentName }}</td>
                    <td>
                      <a [routerLink]="['/admin/cases', item.id]" class="btn-table-view">View</a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pending Tasks Panel -->
        <div class="tasks-card">
          <div class="card-header-flex">
            <h3>Urgent Priorities & Tasks</h3>
            <a routerLink="/admin/tasks" class="view-all-link">All tasks →</a>
          </div>

          <div class="task-items-list">
            @for (task of tasks$ | async; track task.id) {
              <div class="task-row" [class.completed]="task.status === 'completed'">
                <div class="task-checkbox" (click)="toggleTask(task.id)">
                  @if (task.status === 'completed') {
                    <span class="checked-icon">✓</span>
                  }
                </div>
                <div class="task-info">
                  <div class="task-title">{{ task.title }}</div>
                  <div class="task-meta">
                    <crm-status-badge [status]="task.priority" />
                    <span class="due-date">Due: {{ task.dueDate | date:'mediumDate' }}</span>
                    <span class="agent-tag">{{ task.assignedAgentName }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;

      h2 {
        font-size: 1.65rem;
        color: #0F172A;
        margin-bottom: 0.25rem;
      }
      .subtitle {
        color: #64748B;
        font-size: 0.925rem;
        margin: 0;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn-primary-action {
      background: #2563EB;
      color: #FFFFFF;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      text-decoration: none;
      transition: background 150ms ease;
      &:hover { background: #1D4ED8; }
    }

    .btn-secondary-action {
      background: #FFFFFF;
      color: #0F172A;
      border: 1px solid #CBD5E1;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      text-decoration: none;
      transition: all 150ms ease;
      &:hover { background: #F8FAFC; border-color: #94A3B8; }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.25rem;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .chart-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    .chart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;

      h3 { font-size: 1rem; color: #0F172A; margin: 0; }
    }

    .chart-tag {
      font-size: 0.75rem;
      color: #64748B;
      background: #F1F5F9;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
    }

    .chart-wrapper {
      height: 240px;
      position: relative;
    }

    .donut-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tables-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.25rem;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .table-card, .tasks-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    .card-header-flex {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;

      h3 { font-size: 1.05rem; color: #0F172A; margin: 0; }
    }

    .view-all-link {
      font-size: 0.8125rem;
      color: #2563EB;
      font-weight: 600;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }

    .table-responsive {
      overflow-x: auto;
    }

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

      tr:last-child td {
        border-bottom: none;
      }
    }

    .case-link {
      font-family: monospace;
      font-weight: 700;
      color: #2563EB;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }

    .amount-cell {
      font-weight: 600;
      color: #0F172A;
    }

    .btn-table-view {
      padding: 0.25rem 0.65rem;
      background: #F1F5F9;
      color: #334155;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      text-decoration: none;
      &:hover { background: #E2E8F0; color: #0F172A; }
    }

    .task-items-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .task-row {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 8px;
      border: 1px solid #F1F5F9;
      background: #FAFAFA;
      transition: all 150ms ease;

      &.completed {
        opacity: 0.6;
        .task-title { text-decoration: line-through; }
      }
    }

    .task-checkbox {
      width: 18px;
      height: 18px;
      border: 2px solid #CBD5E1;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      margin-top: 2px;

      &:hover { border-color: #2563EB; }
    }

    .checked-icon {
      color: #2563EB;
      font-size: 0.75rem;
      font-weight: 800;
    }

    .task-info {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      flex: 1;
    }

    .task-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #0F172A;
    }

    .task-meta {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.75rem;
      color: #64748B;
      flex-wrap: wrap;
    }

    .agent-tag {
      background: #EFF6FF;
      color: #1D4ED8;
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 500;
    }
  `]
})
export class AdminDashboardComponent {
  private caseService = inject(CrmCaseService);
  private taskService = inject(TaskService);

  readonly cases$ = this.caseService.cases$;
  readonly tasks$ = this.taskService.tasks$;

  // Monthly Recovery Bar Chart
  readonly barChartType: ChartType = 'bar';
  readonly barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        ticks: {
          callback: (value) => `$${Number(value) / 1000}k`
        }
      }
    }
  };

  readonly barChartData: ChartData<'bar'> = {
    labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        data: [42000, 68000, 54000, 95000, 112000, 142000],
        backgroundColor: '#2563EB',
        hoverBackgroundColor: '#1D4ED8',
        borderRadius: 6
      }
    ]
  };

  // Category Distribution Pie Chart
  readonly pieChartType: ChartType = 'doughnut';
  readonly pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  readonly pieChartData: ChartData<'doughnut'> = {
    labels: ['Tax Foreclosure', 'Mortgage Surplus', 'Unclaimed Property', 'Other'],
    datasets: [
      {
        data: [45, 35, 15, 5],
        backgroundColor: ['#2563EB', '#10B981', '#F59E0B', '#64748B']
      }
    ]
  };

  toggleTask(taskId: string): void {
    this.taskService.toggleComplete(taskId).subscribe();
  }
}
