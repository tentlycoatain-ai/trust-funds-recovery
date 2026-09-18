import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'crm-agent-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="brand-header">
          <div class="logo-mark"><img src="/assets/brand/tfr-mark.svg" alt="Trust Funds Recovery" /></div>
          <h2>Agent Workspace</h2>
          <p>Trust Funds Recovery Specialist Portal</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">Agent Email</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              class="form-control"
              placeholder="agent@trustfundsrecovery.com"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              class="form-control"
              placeholder="••••••••••••"
            />
          </div>

          <button type="submit" class="btn-submit">
            Sign In to Agent Portal
          </button>
        </form>

        <div class="demo-quick-box">
          <span class="demo-tag">Developer / Demo Mode</span>
          <button type="button" class="btn-quick-demo" (click)="quickLogin()">
            ⚡ 1-Click Agent Demo Login (Marcus Vance)
          </button>
        </div>

        <div class="login-footer">
          <a routerLink="/admin/login">Switch to Admin Portal <img class="real-icon real-icon-inline" src="/assets/icons/forward-card.png" alt="" aria-hidden="true" /></a>
          <span class="divider">•</span>
          <a routerLink="/">Public Website</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top right, #111827, #0F172A);
      padding: 1.5rem;
    }
    .login-card {
      background: #FFFFFF;
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    .brand-header {
      text-align: center;
      margin-bottom: 2rem;

      .logo-mark {
        width: 52px;
        height: 52px;
        background: #ECFDF5;
        color: #059669;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
      }
      h2 {
        font-size: 1.5rem;
        color: #0F172A;
        margin-bottom: 0.25rem;
      }
      p {
        font-size: 0.875rem;
        color: #64748B;
      }
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;

      label {
        font-size: 0.8125rem;
        font-weight: 600;
        color: #334155;
      }
    }
    .form-control {
      padding: 0.75rem 1rem;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      font-size: 0.925rem;
      transition: all 150ms ease;

      &:focus {
        outline: none;
        border-color: #059669;
        box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
      }
    }
    .btn-submit {
      background: #059669;
      color: #FFFFFF;
      font-weight: 600;
      padding: 0.85rem;
      border-radius: 8px;
      font-size: 0.95rem;
      cursor: pointer;
      border: none;
      transition: background 150ms ease;

      &:hover {
        background: #047857;
      }
    }
    .demo-quick-box {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #F8FAFC;
      border: 1px dashed #CBD5E1;
      border-radius: 10px;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .demo-tag {
      font-size: 0.75rem;
      color: #64748B;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .btn-quick-demo {
      background: #111827;
      color: #34D399;
      font-weight: 600;
      font-size: 0.875rem;
      padding: 0.65rem 1rem;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      transition: all 150ms ease;

      &:hover {
        background: #1F2937;
        color: #6EE7B7;
      }
    }
    .login-footer {
      margin-top: 1.75rem;
      text-align: center;
      font-size: 0.8125rem;
      color: #64748B;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;

      a {
        color: #059669;
        text-decoration: none;
        font-weight: 500;
        &:hover { text-decoration: underline; }
      }
      .divider { color: #CBD5E1; }
    }
  `]
})
export class AgentLoginComponent {
  private authService = inject(AuthService);

  email = 'marcus.vance@trustfundsrecovery.com';
  password = '••••••••••••';

  onSubmit(): void {
    this.authService.login({ email: this.email, password: this.password }, 'agent');
  }

  quickLogin(): void {
    this.authService.quickLoginAs('agent');
  }
}
