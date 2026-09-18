import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { AgentService } from '../../../core/services/agent.service';

@Component({
  selector: 'crm-admin-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">My Profile</h1>
        <p class="page-subtitle">Manage your account information and preferences</p>
      </div>

      <div class="profile-layout">
        <!-- Left Column -->
        <div class="profile-sidebar">
          <div class="profile-card">
            <div class="profile-avatar-wrap">
              <img [src]="user()?.avatar" [alt]="user()?.name" class="profile-avatar">
              <div class="avatar-badge admin">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
            </div>
            <div class="profile-name">{{ user()?.name }}</div>
            <div class="profile-role-badge">Administrator</div>
            <div class="profile-email">{{ user()?.email }}</div>

            <div class="profile-divider"></div>

            <div class="profile-stat-row">
              <div class="profile-stat"><span>48</span><label>Days Active</label></div>
              <div class="profile-stat"><span>3</span><label>Agents Managed</label></div>
              <div class="profile-stat"><span>142</span><label>Reports Run</label></div>
            </div>
          </div>

          <div class="profile-quick-links">
            <button class="quick-link active" (click)="setSection('personal')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Personal Info
            </button>
            <button class="quick-link" (click)="setSection('security')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Security
            </button>
            <button class="quick-link" (click)="setSection('preferences')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 19.07l-1.41 1.41M19.07 19.07l-1.41-1.41M4.93 4.93l-1.41 1.41M22 12h-2M4 12H2M12 22v-2M12 4V2"/></svg>
              Preferences
            </button>
          </div>
        </div>

        <!-- Right Column -->
        <div class="profile-content">
          <!-- Personal Info -->
          <div class="profile-section">
            <div class="section-header">
              <h2 class="section-title">Personal Information</h2>
              <button class="btn btn-primary-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit
              </button>
            </div>
            <div class="info-grid">
              <div class="info-field">
                <label>Full Name</label>
                <div class="info-value">{{ user()?.name }}</div>
              </div>
              <div class="info-field">
                <label>Email Address</label>
                <div class="info-value">{{ user()?.email }}</div>
              </div>
              <div class="info-field">
                <label>Role</label>
                <div class="info-value">System Administrator</div>
              </div>
              <div class="info-field">
                <label>Department</label>
                <div class="info-value">Management</div>
              </div>
              <div class="info-field">
                <label>Phone</label>
                <div class="info-value">+1 (555) 000-1000</div>
              </div>
              <div class="info-field">
                <label>Time Zone</label>
                <div class="info-value">America/New_York (EST)</div>
              </div>
            </div>
          </div>

          <!-- Security Section -->
          <div class="profile-section">
            <div class="section-header">
              <h2 class="section-title">Security</h2>
            </div>
            <div class="security-items">
              <div class="security-item">
                <div class="security-item-left">
                  <div class="security-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
                  <div>
                    <div class="security-name">Password</div>
                    <div class="security-hint">Last changed 30 days ago</div>
                  </div>
                </div>
                <button class="btn-text">Change Password</button>
              </div>
              <div class="security-item">
                <div class="security-item-left">
                  <div class="security-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                  <div>
                    <div class="security-name">Two-Factor Authentication</div>
                    <div class="security-hint">Adds an extra layer of security</div>
                  </div>
                </div>
                <div class="toggle-switch">
                  <input type="checkbox" id="2fa" checked>
                  <label for="2fa"></label>
                </div>
              </div>
              <div class="security-item">
                <div class="security-item-left">
                  <div class="security-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M8 12a4 4 0 0 0 4 4V8a4 4 0 0 0-4 4z"/></svg></div>
                  <div>
                    <div class="security-name">Login Sessions</div>
                    <div class="security-hint">1 active session</div>
                  </div>
                </div>
                <button class="btn-text danger">Revoke All</button>
              </div>
            </div>
          </div>

          <!-- Preferences -->
          <div class="profile-section">
            <div class="section-header">
              <h2 class="section-title">Notification Preferences</h2>
            </div>
            <div class="pref-list">
              @for (pref of preferences(); track pref.id) {
                <div class="pref-item">
                  <div>
                    <div class="pref-name">{{ pref.name }}</div>
                    <div class="pref-hint">{{ pref.hint }}</div>
                  </div>
                  <div class="toggle-switch">
                    <input type="checkbox" [id]="pref.id" [checked]="pref.enabled" (change)="togglePref(pref.id)">
                    <label [for]="pref.id"></label>
                  </div>
                </div>
              }
            </div>
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
    .profile-layout { display: grid; grid-template-columns: 280px 1fr; gap: 24px; align-items: start; }
    .profile-card { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 12px; }
    .profile-avatar-wrap { position: relative; display: inline-block; margin-bottom: 16px; }
    .profile-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--crm-border); }
    .avatar-badge { position: absolute; bottom: 2px; right: 2px; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid var(--crm-surface); }
    .avatar-badge.admin { background: var(--crm-accent); color: white; }
    .profile-name { font-size: 18px; font-weight: 700; color: var(--crm-text-primary); margin-bottom: 6px; }
    .profile-role-badge { display: inline-block; font-size: 11px; font-weight: 600; background: rgba(59,130,246,0.1); color: var(--crm-accent); padding: 3px 10px; border-radius: 10px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .profile-email { font-size: 13px; color: var(--crm-text-secondary); }
    .profile-divider { border: none; border-top: 1px solid var(--crm-border); margin: 20px 0; }
    .profile-stat-row { display: flex; justify-content: space-around; }
    .profile-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .profile-stat span { font-size: 20px; font-weight: 700; color: var(--crm-text-primary); }
    .profile-stat label { font-size: 11px; color: var(--crm-text-muted); }
    .profile-quick-links { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 12px; overflow: hidden; }
    .quick-link { display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 16px; border: none; background: transparent; font-size: 13px; font-weight: 500; color: var(--crm-text-secondary); cursor: pointer; transition: all 0.15s; text-align: left; border-left: 3px solid transparent; }
    .quick-link:hover { background: var(--crm-surface-2); color: var(--crm-text-primary); }
    .quick-link.active { color: var(--crm-accent); border-left-color: var(--crm-accent); background: rgba(59,130,246,0.05); }
    .profile-content { display: flex; flex-direction: column; gap: 16px; }
    .profile-section { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 16px; padding: 24px; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .section-title { font-size: 16px; font-weight: 600; color: var(--crm-text-primary); margin: 0; }
    .btn-primary-sm { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; background: var(--crm-accent); color: white; border: none; border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer; transition: opacity 0.2s; }
    .btn-primary-sm:hover { opacity: 0.9; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .info-field label { font-size: 12px; font-weight: 500; color: var(--crm-text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block; }
    .info-value { font-size: 14px; color: var(--crm-text-primary); font-weight: 500; }
    .security-items { display: flex; flex-direction: column; gap: 1px; }
    .security-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--crm-border); }
    .security-item:last-child { border-bottom: none; padding-bottom: 0; }
    .security-item-left { display: flex; align-items: center; gap: 12px; }
    .security-icon { width: 36px; height: 36px; background: var(--crm-surface-2); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--crm-text-secondary); }
    .security-name { font-size: 14px; font-weight: 500; color: var(--crm-text-primary); }
    .security-hint { font-size: 12px; color: var(--crm-text-muted); margin-top: 2px; }
    .btn-text { background: none; border: none; font-size: 13px; font-weight: 500; color: var(--crm-accent); cursor: pointer; padding: 6px 10px; border-radius: 6px; }
    .btn-text:hover { background: rgba(59,130,246,0.08); }
    .btn-text.danger { color: #dc2626; }
    .btn-text.danger:hover { background: #fef2f2; }
    .toggle-switch { position: relative; display: inline-block; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-switch label { display: block; width: 44px; height: 24px; background: #e2e8f0; border-radius: 12px; cursor: pointer; transition: background 0.2s; }
    .toggle-switch input:checked + label { background: var(--crm-accent); }
    .toggle-switch label::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
    .toggle-switch input:checked + label::after { transform: translateX(20px); }
    .pref-list { display: flex; flex-direction: column; gap: 0; }
    .pref-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--crm-border); }
    .pref-item:last-child { border-bottom: none; padding-bottom: 0; }
    .pref-name { font-size: 14px; font-weight: 500; color: var(--crm-text-primary); margin-bottom: 2px; }
    .pref-hint { font-size: 12px; color: var(--crm-text-muted); }
    @media (max-width: 768px) { .profile-layout { grid-template-columns: 1fr; } .info-grid { grid-template-columns: 1fr; } }
  `]
})
export class AdminProfileComponent {
  private authService = inject(AuthService);
  user = this.authService.currentUser;
  activeSection = signal('personal');

  preferences = signal([
    { id: 'pref-1', name: 'New Case Assignments', hint: 'Get notified when a case is assigned or reassigned', enabled: true },
    { id: 'pref-2', name: 'Payment Updates', hint: 'Alerts for new payments and payment failures', enabled: true },
    { id: 'pref-3', name: 'Agent Activity', hint: 'Daily summary of agent performance metrics', enabled: false },
    { id: 'pref-4', name: 'Lead Conversions', hint: 'When a lead is converted to a customer', enabled: true },
    { id: 'pref-5', name: 'System Reports', hint: 'Weekly system-generated reports', enabled: false },
  ]);

  setSection(section: string) {
    this.activeSection.set(section);
  }

  togglePref(id: string) {
    this.preferences.update(prefs => prefs.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  }
}
