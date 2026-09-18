import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { CallService } from '../../../core/services/call.service';
import { CustomerService } from '../../../core/services/customer.service';
import { AgentService } from '../../../core/services/agent.service';
import { Call } from '../../../core/models/call.model';
import { Customer } from '../../../core/models/customer.model';
import { Agent } from '../../../core/models/agent.model';

@Component({
  selector: 'crm-admin-dialer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Live Call Monitor</h1>
          <p class="page-subtitle">Real-time visibility into all active and recent agent calls</p>
        </div>
        <div class="live-indicator">
          <div class="pulse-dot"></div>
          <span>Live</span>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-icon active-calls">
            <img class="real-icon real-icon-inline" src="/assets/icons/phone-handset.png" alt="" aria-hidden="true" />
          </div>
          <div>
            <div class="summary-num">{{ activeCalls().length }}</div>
            <div class="summary-label">Active Calls</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">
            <img class="real-icon real-icon-inline" src="/assets/icons/phone-handset.png" alt="" aria-hidden="true" />
          </div>
          <div>
            <div class="summary-num">{{ agents().length }}</div>
            <div class="summary-label">Agents Available</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">
            <img class="real-icon real-icon-inline" src="/assets/icons/phone-handset.png" alt="" aria-hidden="true" />
          </div>
          <div>
            <div class="summary-num">{{ todayCallCount() }}</div>
            <div class="summary-label">Calls Today</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">
            <img class="real-icon real-icon-inline" src="/assets/icons/phone-handset.png" alt="" aria-hidden="true" />
          </div>
          <div>
            <div class="summary-num">{{ avgDuration() }}</div>
            <div class="summary-label">Avg Duration</div>
          </div>
        </div>
      </div>

      <!-- Active Calls Panel -->
      <div class="panel">
        <div class="panel-header">
          <h2 class="panel-title">Active Calls</h2>
          <div class="panel-badge">{{ activeCalls().length }} Live</div>
        </div>

        @if (activeCalls().length > 0) {
          <div class="active-calls-grid">
            @for (call of activeCalls(); track call.id) {
              <div class="active-call-card">
                <div class="active-call-header">
                  <div class="agent-info">
                    <img [src]="getAgentAvatar(call.agentId)" [alt]="call.agentId" class="agent-avatar">
                    <div>
                      <div class="agent-name">{{ getAgentName(call.agentId) }}</div>
                      <div class="call-started">Started {{ formatTime(call.timestamp) }}</div>
                    </div>
                  </div>
                  <div class="live-badge">
                    <div class="mini-pulse"></div>
                    LIVE
                  </div>
                </div>
                <div class="active-call-body">
                  <div class="call-detail-row">
                    <img class="real-icon real-icon-inline" src="/assets/icons/phone-handset.png" alt="" aria-hidden="true" />
                    <span>{{ getCustomerName(call.customerId || '') }}</span>
                  </div>
                  <div class="call-detail-row">
                    <img class="real-icon real-icon-inline" src="/assets/icons/phone-handset.png" alt="" aria-hidden="true" />
                    <span>████-████-████</span>
                    <span class="masked-label">Masked</span>
                  </div>
                  <div class="call-type-badge {{ call.direction }}">{{ call.direction | titlecase }}</div>
                </div>
                <div class="active-call-actions">
                  <button class="call-action-btn">Monitor</button>
                  <button class="call-action-btn danger">End Call</button>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="empty-calls">
            <img class="real-icon real-icon-inline" src="/assets/icons/phone-handset.png" alt="" aria-hidden="true" />
            <p>No active calls at this moment</p>
          </div>
        }
      </div>

      <!-- Agent Status Grid -->
      <div class="panel">
        <div class="panel-header">
          <h2 class="panel-title">Agent Status Board</h2>
        </div>
        <table class="crm-table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Status</th>
              <th>Calls Today</th>
              <th>Connected</th>
              <th>Avg. Duration</th>
              <th>Last Call</th>
            </tr>
          </thead>
          <tbody>
            @for (agent of agents(); track agent.id) {
              <tr>
                <td>
                  <div class="agent-cell">
                    <img [src]="agent.avatar" [alt]="agent.firstName" class="agent-avatar-sm">
                    <div>
                      <div class="agent-cell-name">{{ agent.firstName }} {{ agent.lastName }}</div>
                      <div class="agent-cell-role">{{ agent.role }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="status-dot" [class]="agent.status === 'active' ? 'online' : 'offline'"></span>
                  {{ agent.status | titlecase }}
                </td>
                <td>{{ agent.callsMade }}</td>
                <td>{{ agent.callsConnected }}</td>
                <td>4m 23s</td>
                <td class="text-muted">2h ago</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 700; color: var(--crm-text-primary); margin: 0 0 4px; }
    .page-subtitle { font-size: 14px; color: var(--crm-text-secondary); margin: 0; }
    .live-indicator { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 20px; color: #16a34a; font-size: 14px; font-weight: 600; }
    .pulse-dot { width: 10px; height: 10px; background: #16a34a; border-radius: 50%; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.3); } }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .summary-card { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; }
    .summary-icon { width: 44px; height: 44px; background: var(--crm-surface-2); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--crm-text-secondary); flex-shrink: 0; }
    .summary-icon.active-calls { background: #f0fdf4; color: #16a34a; }
    .summary-num { font-size: 24px; font-weight: 700; color: var(--crm-text-primary); }
    .summary-label { font-size: 12px; color: var(--crm-text-muted); margin-top: 2px; }
    .panel { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
    .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .panel-title { font-size: 16px; font-weight: 600; color: var(--crm-text-primary); margin: 0; }
    .panel-badge { font-size: 12px; font-weight: 600; background: #f0fdf4; color: #16a34a; border: 1px solid #86efac; padding: 3px 10px; border-radius: 10px; }
    .active-calls-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .active-call-card { border: 1px solid var(--crm-border); border-radius: 12px; padding: 16px; background: var(--crm-surface-2); }
    .active-call-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .agent-info { display: flex; align-items: center; gap: 10px; }
    .agent-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
    .agent-name { font-size: 14px; font-weight: 600; color: var(--crm-text-primary); }
    .call-started { font-size: 12px; color: var(--crm-text-muted); margin-top: 1px; }
    .live-badge { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: #16a34a; background: #f0fdf4; border: 1px solid #86efac; padding: 3px 8px; border-radius: 10px; }
    .mini-pulse { width: 6px; height: 6px; background: #16a34a; border-radius: 50%; animation: pulse 1.5s infinite; }
    .active-call-body { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
    .call-detail-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--crm-text-secondary); }
    .masked-label { font-size: 10px; background: #fef3c7; color: #d97706; padding: 1px 6px; border-radius: 8px; font-weight: 600; }
    .call-type-badge { display: inline-block; font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 10px; text-transform: capitalize; }
    .call-type-badge.outbound { background: rgba(59,130,246,0.1); color: var(--crm-accent); }
    .call-type-badge.inbound { background: rgba(34,197,94,0.1); color: #16a34a; }
    .active-call-actions { display: flex; gap: 8px; }
    .call-action-btn { flex: 1; padding: 7px 12px; border-radius: 7px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1px solid var(--crm-border); background: var(--crm-surface); color: var(--crm-text-secondary); transition: all 0.15s; }
    .call-action-btn:hover { background: var(--crm-surface-2); color: var(--crm-text-primary); }
    .call-action-btn.danger { color: #dc2626; border-color: #fca5a5; }
    .call-action-btn.danger:hover { background: #fef2f2; }
    .empty-calls { text-align: center; padding: 40px; color: var(--crm-text-muted); }
    .empty-calls svg { margin-bottom: 12px; opacity: 0.4; }
    .empty-calls p { font-size: 14px; }
    .crm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .crm-table th { text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--crm-text-muted); border-bottom: 1px solid var(--crm-border); }
    .crm-table td { padding: 12px; border-bottom: 1px solid var(--crm-border); color: var(--crm-text-secondary); vertical-align: middle; }
    .crm-table tr:last-child td { border-bottom: none; }
    .agent-cell { display: flex; align-items: center; gap: 10px; }
    .agent-avatar-sm { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
    .agent-cell-name { font-size: 13px; font-weight: 600; color: var(--crm-text-primary); }
    .agent-cell-role { font-size: 11px; color: var(--crm-text-muted); }
    .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
    .status-dot.online { background: #16a34a; }
    .status-dot.offline { background: #9ca3af; }
    .text-muted { color: var(--crm-text-muted) !important; }
    @media (max-width: 768px) { .summary-grid { grid-template-columns: 1fr 1fr; } }
  `]
})
export class AdminDialerComponent {
  private callService = inject(CallService);
  private customerService = inject(CustomerService);
  private agentService = inject(AgentService);

  calls = toSignal(this.callService.calls$, { initialValue: [] });
  customers = toSignal(this.customerService.customers$, { initialValue: [] });
  agents = toSignal(this.agentService.agents$, { initialValue: [] });

  activeCalls = computed(() => this.calls().filter((c: Call) => c.status === 'in_progress'));
  todayCallCount = computed(() => this.calls().length);
  avgDuration = computed(() => '4m 12s');

  getAgentName(agentId: string): string {
    const agent = this.agents().find((a: Agent) => a.id === agentId);
    return agent ? `${agent.firstName} ${agent.lastName}` : agentId;
  }

  getAgentAvatar(agentId: string): string {
    const agent = this.agents().find((a: Agent) => a.id === agentId);
    return agent?.avatar || '';
  }

  getCustomerName(customerId: string): string {
    const cust = this.customers().find((c: Customer) => c.id === customerId);
    return cust ? `${cust.firstName} ${cust.lastName}` : customerId;
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  }
}
