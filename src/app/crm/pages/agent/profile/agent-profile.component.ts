import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth/auth.service';
import { AgentService } from '../../../core/services/agent.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'crm-agent-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Agent Profile & Workstation</h1>
          <p class="page-subtitle">Personal recovery specialist credentials, assigned queue metrics, and telephony settings</p>
        </div>
      </div>

      <div class="profile-layout">
        <!-- Left: Identity & Performance Card -->
        <div class="profile-card">
          <div class="avatar-wrap">
            <img [src]="user()?.avatar" [alt]="user()?.name" class="avatar-img" />
            <span class="status-indicator-badge online" title="Active on shift"></span>
          </div>

          <h2 class="agent-name">{{ user()?.name }}</h2>
          <span class="role-badge">Recovery Specialist</span>
          <span class="emp-id">ID: {{ agentInfo()?.employeeId || 'TFR-AGT-001' }}</span>

          <div class="divider"></div>

          <!-- Performance Metrics -->
          <div class="stats-column">
            <div class="stat-row">
              <span class="stat-lbl">Department</span>
              <span class="stat-val">{{ agentInfo()?.department || 'Tax Foreclosure Recovery' }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-lbl">Active Cases</span>
              <span class="stat-val">{{ agentInfo()?.activeCases || 12 }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-lbl">Cases Resolved</span>
              <span class="stat-val highlight">{{ agentInfo()?.completedCases || 34 }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-lbl">Connected Calls</span>
              <span class="stat-val">{{ agentInfo()?.callsConnected || 215 }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-lbl">Tenure Since</span>
              <span class="stat-val">{{ agentInfo()?.dateJoined || 'March 2023' }}</span>
            </div>
          </div>
        </div>

        <!-- Right: Settings & Preferences -->
        <div class="settings-column">
          <!-- Contact & Credentials -->
          <div class="panel-section">
            <div class="section-title">Identity & Assigned Line</div>
            <div class="form-grid">
              <div class="field-box">
                <label class="field-lbl">Full Legal Name</label>
                <input type="text" [value]="user()?.name" readonly class="input-readonly" />
              </div>
              <div class="field-box">
                <label class="field-lbl">Email Address</label>
                <input type="email" [value]="user()?.email" readonly class="input-readonly" />
              </div>
              <div class="field-box">
                <label class="field-lbl">Direct Extension</label>
                <input type="text" value="Ext. 401 (Direct WebRTC)" readonly class="input-readonly" />
              </div>
              <div class="field-box">
                <label class="field-lbl">Shift Jurisdiction Coverage</label>
                <input type="text" value="Western & Pacific Counties" readonly class="input-readonly" />
              </div>
            </div>
          </div>

          <!-- Telephony / Dialer Settings -->
          <div class="panel-section">
            <div class="section-title">Dialer & Telephony Configuration</div>
            <div class="t-settings-list">
              <div class="setting-item">
                <div>
                  <span class="s-name">Auto After-Call Work (Wrap-up)</span>
                  <span class="s-desc">Automatically open call disposition notes modal after hangup</span>
                </div>
                <input type="checkbox" [(ngModel)]="autoWrapUp" class="check-toggle" />
              </div>

              <div class="setting-item">
                <div>
                  <span class="s-name">Audio Inbound Ringtone Chime</span>
                  <span class="s-desc">Play audio tone on claimant incoming callback or transferred line</span>
                </div>
                <input type="checkbox" [(ngModel)]="ringChime" class="check-toggle" />
              </div>

              <div class="setting-item">
                <div>
                  <span class="s-name">Strict Phone Privacy Masking</span>
                  <span class="s-desc">Mandatory enterprise policy: real phone numbers masked for claimant protection</span>
                </div>
                <span class="badge-locked">Enforced by Admin</span>
              </div>
            </div>
          </div>

          <!-- Save Button -->
          <div class="action-footer">
            <button class="btn-save" (click)="savePreferences()">Save Workstation Preferences</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; max-width: 1100px; margin: 0 auto; }
    .page-header { margin-bottom: 28px; }
    .page-title { font-size: 24px; font-weight: 700; color: var(--crm-text-primary); margin: 0 0 4px; }
    .page-subtitle { font-size: 14px; color: var(--crm-text-secondary); margin: 0; }
    .profile-layout { display: grid; grid-template-columns: 320px 1fr; gap: 24px; align-items: start; }
    .profile-card { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 16px; padding: 24px; text-align: center; }
    .avatar-wrap { position: relative; display: inline-block; margin-bottom: 16px; }
    .avatar-img { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid var(--crm-border); }
    .status-indicator-badge { position: absolute; bottom: 2px; right: 4px; width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--crm-surface); }
    .status-indicator-badge.online { background: #16a34a; }
    .agent-name { font-size: 18px; font-weight: 700; color: var(--crm-text-primary); margin: 0 0 4px; }
    .role-badge { display: inline-block; font-size: 11px; font-weight: 600; background: rgba(59,130,246,0.1); color: var(--crm-accent); padding: 3px 10px; border-radius: 12px; margin-bottom: 4px; }
    .emp-id { display: block; font-size: 11px; font-family: monospace; color: var(--crm-text-muted); }
    .divider { border-top: 1px solid var(--crm-border); margin: 20px 0; }
    .stats-column { display: flex; flex-direction: column; gap: 12px; text-align: left; }
    .stat-row { display: flex; justify-content: space-between; font-size: 13px; }
    .stat-lbl { color: var(--crm-text-muted); }
    .stat-val { font-weight: 600; color: var(--crm-text-primary); }
    .stat-val.highlight { color: #16a34a; }
    .settings-column { display: flex; flex-direction: column; gap: 20px; }
    .panel-section { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 16px; padding: 22px; }
    .section-title { font-size: 15px; font-weight: 700; color: var(--crm-text-primary); margin-bottom: 16px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field-box { display: flex; flex-direction: column; gap: 6px; }
    .field-lbl { font-size: 11px; font-weight: 600; color: var(--crm-text-muted); text-transform: uppercase; }
    .input-readonly { border: 1px solid var(--crm-border); border-radius: 8px; background: var(--crm-surface-2); padding: 9px 12px; font-size: 13px; color: var(--crm-text-primary); outline: none; }
    .t-settings-list { display: flex; flex-direction: column; gap: 14px; }
    .setting-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--crm-border); }
    .setting-item:last-child { border-bottom: none; }
    .s-name { font-size: 13px; font-weight: 600; color: var(--crm-text-primary); display: block; margin-bottom: 2px; }
    .s-desc { font-size: 11px; color: var(--crm-text-muted); }
    .check-toggle { width: 18px; height: 18px; accent-color: var(--crm-accent); cursor: pointer; }
    .badge-locked { font-size: 11px; font-weight: 600; color: #d97706; background: #fef3c7; padding: 4px 8px; border-radius: 6px; }
    .action-footer { display: flex; justify-content: flex-end; }
    .btn-save { padding: 10px 20px; border-radius: 8px; background: var(--crm-accent); color: white; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
    .btn-save:hover { opacity: 0.9; }
    @media (max-width: 768px) { .profile-layout { grid-template-columns: 1fr; } .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class AgentProfileComponent {
  private authService = inject(AuthService);
  private agentService = inject(AgentService);
  private toastService = inject(ToastService);

  user = this.authService.currentUser;
  private allAgents = toSignal(this.agentService.agents$, { initialValue: [] });

  agentInfo = computed(() => {
    const list = this.allAgents();
    const current = this.user();
    return list.find(a => a.id === current?.agentId || a.email === current?.email) || list[0];
  });

  autoWrapUp = true;
  ringChime = true;

  savePreferences() {
    this.toastService.show('Workstation preferences updated successfully', 'success');
  }
}
