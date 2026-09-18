import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MOCK_COMMUNICATIONS } from '../../../core/mock-data/mock-db';
import { Communication } from '../../../core/models';
import { CustomerService } from '../../../core/services/customer.service';
import { AgentService } from '../../../core/services/agent.service';

@Component({
  selector: 'crm-admin-communications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Communications Log</h1>
          <p class="page-subtitle">All emails, SMS messages and communications with customers</p>
        </div>
        <button class="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Communication
        </button>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search communications..." class="search-input" [(ngModel)]="searchTerm" (ngModelChange)="onSearch()">
        </div>
        <div class="filter-chips">
          @for (type of types; track type) {
            <button class="chip" [class.active]="activeType() === type" (click)="setType(type)">
              {{ type | titlecase }}
            </button>
          }
        </div>
      </div>

      <!-- Table -->
      <div class="table-card">
        <table class="crm-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Subject / Preview</th>
              <th>Customer</th>
              <th>Agent</th>
              <th>Direction</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            @for (comm of filtered(); track comm.id) {
              <tr>
                <td>
                  <div class="type-icon {{ comm.type }}">
                    @switch (comm.type) {
                      @case ('email') {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      }
                      @case ('sms') {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      }
                      @default {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg>
                      }
                    }
                    {{ comm.type | titlecase }}
                  </div>
                </td>
                <td>
                  <div class="subject">{{ comm.subject || '(No subject)' }}</div>
                  <div class="preview">{{ comm.content | slice:0:60 }}...</div>
                </td>
                <td>{{ comm.customerName || getCustomerName(comm.customerId || '') }}</td>
                <td>{{ comm.agentName || getAgentName(comm.agentId) }}</td>
                <td>
                  <span class="direction-badge outbound">Outbound</span>
                </td>
                <td>
                  <span class="status-badge {{ comm.status }}">{{ comm.status }}</span>
                </td>
                <td class="text-muted">{{ formatDate(comm.timestamp) }}</td>
              </tr>
            }
          </tbody>
        </table>

        @if (filtered().length === 0) {
          <div class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/></svg>
            <p>No communications found</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .page-title { font-size: 24px; font-weight: 700; color: var(--crm-text-primary); margin: 0 0 4px; }
    .page-subtitle { font-size: 14px; color: var(--crm-text-secondary); margin: 0; }
    .btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: var(--crm-accent); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
    .btn-primary:hover { opacity: 0.9; }
    .filter-bar { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
    .search-box { display: flex; align-items: center; gap: 8px; background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 8px; padding: 8px 14px; flex: 1; min-width: 200px; }
    .search-input { border: none; background: transparent; font-size: 14px; color: var(--crm-text-primary); outline: none; flex: 1; }
    .filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }
    .chip { padding: 6px 14px; border: 1px solid var(--crm-border); border-radius: 20px; font-size: 12px; font-weight: 500; background: var(--crm-surface); color: var(--crm-text-secondary); cursor: pointer; transition: all 0.15s; }
    .chip.active { background: var(--crm-accent); color: white; border-color: var(--crm-accent); }
    .table-card { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 16px; overflow: hidden; }
    .crm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .crm-table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--crm-text-muted); border-bottom: 1px solid var(--crm-border); background: var(--crm-surface-2); }
    .crm-table td { padding: 12px 16px; border-bottom: 1px solid var(--crm-border); color: var(--crm-text-secondary); vertical-align: middle; }
    .crm-table tr:last-child td { border-bottom: none; }
    .crm-table tr:hover td { background: var(--crm-surface-2); }
    .type-icon { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 8px; }
    .type-icon.email { background: rgba(59,130,246,0.1); color: #2563eb; }
    .type-icon.sms { background: rgba(16,185,129,0.1); color: #059669; }
    .type-icon.call { background: rgba(249,115,22,0.1); color: #ea580c; }
    .subject { font-size: 13px; font-weight: 600; color: var(--crm-text-primary); margin-bottom: 2px; }
    .preview { font-size: 12px; color: var(--crm-text-muted); max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .direction-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 8px; text-transform: capitalize; }
    .direction-badge.outbound { background: rgba(59,130,246,0.1); color: #2563eb; }
    .direction-badge.inbound { background: rgba(34,197,94,0.1); color: #16a34a; }
    .status-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 8px; text-transform: capitalize; }
    .status-badge.sent { background: #f0fdf4; color: #16a34a; }
    .status-badge.delivered { background: #eff6ff; color: #2563eb; }
    .status-badge.failed { background: #fef2f2; color: #dc2626; }
    .status-badge.pending { background: #fffbeb; color: #d97706; }
    .text-muted { color: var(--crm-text-muted) !important; font-size: 12px; }
    .empty-state { text-align: center; padding: 48px; color: var(--crm-text-muted); }
    .empty-state svg { margin-bottom: 12px; opacity: 0.4; }
    .empty-state p { font-size: 14px; }
  `]
})
export class AdminCommunicationsComponent {
  private customerService = inject(CustomerService);
  private agentService = inject(AgentService);

  types = ['all', 'email', 'sms', 'call'];
  activeType = signal('all');
  searchTerm = '';
  private comms = signal<Communication[]>(MOCK_COMMUNICATIONS || []);

  filtered = computed(() => {
    const type = this.activeType();
    const term = this.searchTerm.toLowerCase();
    return this.comms().filter(c => {
      const matchesType = type === 'all' || c.type === type;
      const matchesSearch = !term || c.subject?.toLowerCase().includes(term) || c.content?.toLowerCase().includes(term);
      return matchesType && matchesSearch;
    });
  });

  setType(type: string) {
    this.activeType.set(type);
  }

  onSearch() {}

  getCustomerName(id: string): string {
    const c = this.customerService.customers.find((x: any) => x.id === id);
    return c ? `${c.firstName} ${c.lastName}` : id;
  }

  getAgentName(id: string): string {
    const a = this.agentService.agents.find((x: any) => x.id === id);
    return a ? `${a.firstName} ${a.lastName}` : id;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
