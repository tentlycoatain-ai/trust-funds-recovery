import { Routes } from '@angular/router';

import { HomeComponent } from './pages/public/home/home.component';
import { AboutComponent } from './pages/public/about/about.component';
import { ContactComponent } from './pages/public/contact/contact.component';
import { HowItWorksComponent } from './pages/public/how-it-works/how-it-works.component';
import { ServicesComponent } from './pages/public/services/services.component';
import { LegalComponent } from './pages/public/legal/legal.component';
import { ResourcesComponent } from './pages/public/resources/resources.component';
import { PrivacyPolicyComponent } from './pages/public/legal/privacy-policy/privacy-policy.component';
import { TermsComponent } from './pages/public/legal/terms/terms.component';
import { DisclaimerComponent } from './pages/public/legal/disclaimer/disclaimer.component';
import { CookiePolicyComponent } from './pages/public/legal/cookie-policy/cookie-policy.component';

// CRM Layouts
import { AdminLayoutComponent } from './crm/layouts/admin-layout/admin-layout.component';
import { AgentLayoutComponent } from './crm/layouts/agent-layout/agent-layout.component';

// CRM Auth
import { AdminLoginComponent } from './crm/auth/admin-login/admin-login.component';
import { AgentLoginComponent } from './crm/auth/agent-login/agent-login.component';

// CRM Guards
import { adminGuard } from './crm/core/auth/admin.guard';
import { agentGuard } from './crm/core/auth/agent.guard';

// Admin Pages
import { AdminDashboardComponent } from './crm/pages/admin/dashboard/admin-dashboard.component';
import { AdminCustomersComponent } from './crm/pages/admin/customers/admin-customers.component';
import { CustomerDetailComponent } from './crm/pages/admin/customers/customer-detail/customer-detail.component';
import { AdminLeadsComponent } from './crm/pages/admin/leads/admin-leads.component';
import { AdminCasesComponent } from './crm/pages/admin/cases/admin-cases.component';
import { CaseDetailComponent } from './crm/pages/admin/cases/case-detail/case-detail.component';
import { AdminAgentsComponent } from './crm/pages/admin/agents/admin-agents.component';
import { AdminTasksComponent } from './crm/pages/admin/tasks/admin-tasks.component';
import { AdminPaymentsComponent } from './crm/pages/admin/payments/admin-payments.component';
import { AdminDocumentsComponent } from './crm/pages/admin/documents/admin-documents.component';
import { AdminCallsComponent } from './crm/pages/admin/calls/admin-calls.component';
import { AdminReportsComponent } from './crm/pages/admin/reports/admin-reports.component';
import { AdminSettingsComponent } from './crm/pages/admin/settings/admin-settings.component';
import { AdminAuditLogsComponent } from './crm/pages/admin/audit-logs/admin-audit-logs.component';
import { AdminNotificationsComponent } from './crm/pages/admin/notifications/admin-notifications.component';
import { AdminProfileComponent } from './crm/pages/admin/profile/admin-profile.component';
import { AdminDialerComponent } from './crm/pages/admin/dialer/admin-dialer.component';
import { AdminCommunicationsComponent } from './crm/pages/admin/communications/admin-communications.component';
import { AdminActivityComponent } from './crm/pages/admin/activity/admin-activity.component';

// Agent Pages
import { AgentDashboardComponent } from './crm/pages/agent/dashboard/agent-dashboard.component';
import { AgentCustomersComponent } from './crm/pages/agent/customers/agent-customers.component';
import { AgentCustomerDetailComponent } from './crm/pages/agent/customers/agent-customer-detail/agent-customer-detail.component';
import { AgentLeadsComponent } from './crm/pages/agent/leads/agent-leads.component';
import { AgentCasesComponent } from './crm/pages/agent/cases/agent-cases.component';
import { AgentTasksComponent } from './crm/pages/agent/tasks/agent-tasks.component';
import { AgentDialerComponent } from './crm/pages/agent/dialer/agent-dialer.component';
import { AgentCallsComponent } from './crm/pages/agent/calls/agent-calls.component';
import { AgentDocumentsComponent } from './crm/pages/agent/documents/agent-documents.component';
import { AgentNotificationsComponent } from './crm/pages/agent/notifications/agent-notifications.component';
import { AgentProfileComponent } from './crm/pages/agent/profile/agent-profile.component';

export const routes: Routes = [
  // Public routes
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'resources', component: ResourcesComponent },
  { path: 'how-it-works', component: HowItWorksComponent },
  {
    path: 'legal',
    component: LegalComponent,
    children: [
      { path: '', redirectTo: 'privacy-policy', pathMatch: 'full' },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 'terms', component: TermsComponent },
      { path: 'disclaimer', component: DisclaimerComponent },
      { path: 'cookie-policy', component: CookiePolicyComponent }
    ]
  },

  // CRM Auth (no layout wrapper)
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'agent/login', component: AgentLoginComponent },

  // Admin CRM (protected by adminGuard, wrapped in AdminLayoutComponent)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'customers', component: AdminCustomersComponent },
      { path: 'customers/:id', component: CustomerDetailComponent },
      { path: 'leads', component: AdminLeadsComponent },
      { path: 'cases', component: AdminCasesComponent },
      { path: 'cases/:id', component: CaseDetailComponent },
      { path: 'agents', component: AdminAgentsComponent },
      { path: 'tasks', component: AdminTasksComponent },
      { path: 'payments', component: AdminPaymentsComponent },
      { path: 'documents', component: AdminDocumentsComponent },
      { path: 'calls', component: AdminCallsComponent },
      { path: 'dialer', component: AdminDialerComponent },
      { path: 'communications', component: AdminCommunicationsComponent },
      { path: 'activity', component: AdminActivityComponent },
      { path: 'reports', component: AdminReportsComponent },
      { path: 'notifications', component: AdminNotificationsComponent },
      { path: 'settings', component: AdminSettingsComponent },
      { path: 'profile', component: AdminProfileComponent },
      { path: 'audit-logs', component: AdminAuditLogsComponent },
    ]
  },

  // Agent CRM (protected by agentGuard, wrapped in AgentLayoutComponent)
  {
    path: 'agent',
    component: AgentLayoutComponent,
    canActivate: [agentGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AgentDashboardComponent },
      { path: 'customers', component: AgentCustomersComponent },
      { path: 'customers/:id', component: AgentCustomerDetailComponent },
      { path: 'leads', component: AgentLeadsComponent },
      { path: 'cases', component: AgentCasesComponent },
      { path: 'tasks', component: AgentTasksComponent },
      { path: 'dialer', component: AgentDialerComponent },
      { path: 'calls', component: AgentCallsComponent },
      { path: 'documents', component: AgentDocumentsComponent },
      { path: 'notifications', component: AgentNotificationsComponent },
      { path: 'profile', component: AgentProfileComponent },
    ]
  },

  { path: '**', redirectTo: '' }
];
