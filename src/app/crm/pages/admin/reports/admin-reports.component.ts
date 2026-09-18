import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'crm-admin-reports',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, StatCardComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Executive Analytics & Performance Reports</h2>
          <p class="subtitle">Recovery trends, revenue yields, claim cycle velocities, and team effectiveness metrics.</p>
        </div>
      </div>

      <!-- Report Metrics -->
      <div class="metrics-grid">
        <crm-stat-card title="Annual Gross Recovery" value="$1,420,000" trend="+32% YoY" [isPositive]="true" iconColor="emerald" />
        <crm-stat-card title="Contingency Revenue" value="$355,000" trend="25.0% flat margin" [isPositive]="true" iconColor="blue" />
        <crm-stat-card title="Average Claim Resolution" value="38 Days" trend="-6 days faster" [isPositive]="true" iconColor="purple" />
        <crm-stat-card title="Court Approval Rate" value="96.2%" trend="+2.4% judicial success" [isPositive]="true" iconColor="amber" />
      </div>

      <!-- Charts Row 1 -->
      <div class="charts-row">
        <div class="chart-card">
          <h3>Quarterly Revenue Progression ($)</h3>
          <div class="chart-box">
            <canvas baseChart [data]="quarterlyData" [options]="barOptions" [type]="'bar'"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <h3>Recovery Channel Breakdown</h3>
          <div class="chart-box donut-box">
            <canvas baseChart [data]="channelData" [options]="pieOptions" [type]="'doughnut'"></canvas>
          </div>
        </div>
      </div>

      <!-- Historical Yield Table -->
      <div class="table-card">
        <h3>Historical Monthly Performance Breakdown</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Cases Closed</th>
              <th>Total Claim Value</th>
              <th>Gross Recovered</th>
              <th>Fees Retained</th>
              <th>Avg Turnaround</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>August 2026</td>
              <td>12</td>
              <td>$340,000</td>
              <td>$312,000</td>
              <td>$78,000</td>
              <td>34 Days</td>
            </tr>
            <tr>
              <td>July 2026</td>
              <td>9</td>
              <td>$280,000</td>
              <td>$265,000</td>
              <td>$66,250</td>
              <td>39 Days</td>
            </tr>
            <tr>
              <td>June 2026</td>
              <td>14</td>
              <td>$410,000</td>
              <td>$385,000</td>
              <td>$96,250</td>
              <td>41 Days</td>
            </tr>
            <tr>
              <td>May 2026</td>
              <td>8</td>
              <td>$195,000</td>
              <td>$195,000</td>
              <td>$48,750</td>
              <td>44 Days</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header h2 { font-size: 1.65rem; color: #0F172A; margin: 0 0 0.25rem 0; }
    .subtitle { color: #64748B; font-size: 0.925rem; margin: 0; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; }
    .charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 1.25rem; @media (max-width: 1024px) { grid-template-columns: 1fr; } }
    .chart-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.5rem; h3 { margin: 0 0 1rem 0; font-size: 1rem; color: #0F172A; } }
    .chart-box { height: 260px; position: relative; }
    .donut-box { display: flex; align-items: center; justify-content: center; }
    .table-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.5rem; h3 { margin: 0 0 1rem 0; font-size: 1.05rem; color: #0F172A; } }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; th { padding: 0.75rem; text-align: left; color: #64748B; border-bottom: 1px solid #E2E8F0; font-weight: 600; } td { padding: 0.85rem; border-bottom: 1px solid #F1F5F9; color: #334155; } }
  `]
})
export class AdminReportsComponent {
  readonly barOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  readonly quarterlyData: ChartData<'bar'> = {
    labels: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026'],
    datasets: [
      {
        data: [180000, 240000, 310000, 290000, 420000, 520000],
        backgroundColor: '#2563EB',
        borderRadius: 6
      }
    ]
  };

  readonly pieOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  readonly channelData: ChartData<'doughnut'> = {
    labels: ['Tax Deed Surplus', 'Mortgage Foreclosure', 'Escrow Overages', 'Estate Funds'],
    datasets: [
      {
        data: [50, 30, 12, 8],
        backgroundColor: ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6']
      }
    ]
  };
}
