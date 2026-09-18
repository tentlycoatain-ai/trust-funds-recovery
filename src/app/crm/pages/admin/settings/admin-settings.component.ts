import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'crm-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Platform Configuration & Security Settings</h2>
          <p class="subtitle">Global contingency percentages, claimant phone privacy compliance, and notification rules.</p>
        </div>
        <button class="btn-save" (click)="saveSettings()">Save Preferences</button>
      </div>

      <div class="settings-grid">
        <!-- Recovery Policies -->
        <div class="setting-card">
          <h3>Recovery & Fee Defaults</h3>
          <div class="form-group">
            <label>Standard Contingency Fee Percentage (%)</label>
            <input type="number" [(ngModel)]="feePercent" class="input-ctrl" />
            <span class="hint">Applied automatically to all new claims unless customized per agreement.</span>
          </div>

          <div class="form-group">
            <label>Minimum Recovery Claim Threshold ($)</label>
            <input type="number" [(ngModel)]="minThreshold" class="input-ctrl" />
            <span class="hint">Minimum overage amount required to qualify for intake review.</span>
          </div>
        </div>

        <!-- Privacy & Security -->
        <div class="setting-card">
          <h3>Data Privacy & Masking Compliance</h3>
          <div class="toggle-row">
            <div>
              <strong>Enforce Strict Agent Phone Masking</strong>
              <p>Masks claimant direct telephone numbers on all agent views (+1 (***) ***-XXXX). Agents initiate contact solely through the verified telephony bridge.</p>
            </div>
            <input type="checkbox" checked disabled class="toggle-check" />
          </div>

          <div class="toggle-row">
            <div>
              <strong>Admin Reveal Audit Logging</strong>
              <p>Whenever an administrator unmasks a claimant's direct phone number, an entry is written to the audit log.</p>
            </div>
            <input type="checkbox" [(ngModel)]="auditAdminReveal" class="toggle-check" />
          </div>
        </div>

        <!-- System & Environment -->
        <div class="setting-card">
          <h3>System Environment</h3>
          <div class="info-row">
            <span>Platform Version</span>
            <strong>v2.4.0 (Enterprise Frontend)</strong>
          </div>
          <div class="info-row">
            <span>Telephony Status</span>
            <span class="badge-active">Simulated Bridge Ready</span>
          </div>
          <div class="info-row">
            <span>Chart Engine</span>
            <strong>Chart.js + ng2-charts</strong>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; h2 { font-size: 1.65rem; color: #0F172A; margin: 0 0 0.25rem 0; } .subtitle { color: #64748B; font-size: 0.925rem; margin: 0; } }
    .btn-save { background: #2563EB; color: #FFF; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; &:hover { background: #1D4ED8; } }
    .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem; }
    .setting-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; h3 { margin: 0; font-size: 1.1rem; color: #0F172A; border-bottom: 1px solid #F1F5F9; padding-bottom: 0.75rem; } }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; label { font-size: 0.8125rem; font-weight: 600; color: #334155; } .hint { font-size: 0.75rem; color: #94A3B8; } }
    .input-ctrl { padding: 0.65rem 0.85rem; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 0.875rem; max-width: 280px; }
    .toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; strong { font-size: 0.875rem; color: #0F172A; } p { margin: 2px 0 0 0; font-size: 0.75rem; color: #64748B; line-height: 1.4; } }
    .toggle-check { width: 20px; height: 20px; cursor: pointer; }
    .info-row { display: flex; justify-content: space-between; font-size: 0.875rem; border-bottom: 1px solid #F8FAFC; padding: 0.5rem 0; color: #475569; }
    .badge-active { background: #ECFDF5; color: #059669; font-weight: 700; font-size: 0.75rem; padding: 2px 8px; border-radius: 9999px; }
  `]
})
export class AdminSettingsComponent {
  private toastService = inject(ToastService);

  feePercent = 25;
  minThreshold = 10000;
  auditAdminReveal = true;

  saveSettings(): void {
    this.toastService.success('Configuration preferences saved successfully!');
  }
}
