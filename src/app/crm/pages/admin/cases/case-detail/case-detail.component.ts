import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CrmCaseService } from '../../../../core/services/case.service';
import { DocumentService } from '../../../../core/services/document.service';
import { TaskService } from '../../../../core/services/task.service';
import { ActivityService } from '../../../../core/services/activity.service';
import { RecoveryCase, CaseStatus } from '../../../../core/models/case.model';
import { CrmDocument } from '../../../../core/models/document.model';
import { Task } from '../../../../core/models/task.model';
import { ActivityEvent } from '../../../../core/models/activity.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'crm-case-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StatusBadgeComponent],
  template: `
    @if (caseItem(); as c) {
      <div class="detail-container">
        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <a routerLink="/admin/cases">← Back to Cases</a>
          <span class="sep">/</span>
          <span>{{ c.caseNumber }}</span>
        </div>

        <!-- Hero Header -->
        <div class="hero-card">
          <div class="hero-main">
            <div class="case-badge-row">
              <span class="case-id-badge">{{ c.caseNumber }}</span>
              <crm-status-badge [status]="c.status" />
              <span class="priority-tag" [ngClass]="c.priority">Priority: {{ c.priority }}</span>
            </div>
            <h2>{{ c.title }}</h2>
            <p class="claimant-sub">
              Claimant: <strong>{{ c.customerName }}</strong> • Jurisdiction: {{ c.filingJurisdiction || 'Local Court' }}
            </p>
          </div>

          <div class="financials-box">
            <div class="fin-item">
              <span class="label">Gross Claim</span>
              <span class="val">\${{ c.claimAmount | number:'1.0-0' }}</span>
            </div>
            <div class="fin-item highlight">
              <span class="label">Contingency Fee ({{ c.feePercentage }}%)</span>
              <span class="val fee">\${{ c.expectedFee | number:'1.0-0' }}</span>
            </div>
            <div class="fin-item">
              <span class="label">Recovered</span>
              <span class="val">\${{ c.recoveredAmount | number:'1.0-0' }}</span>
            </div>
          </div>
        </div>

        <!-- Lifecycle Progression Stepper -->
        <div class="stepper-card">
          <div class="stepper-header">
            <h4>Recovery Lifecycle Progression</h4>
            <div class="status-change-control">
              <label>Update Status:</label>
              <select [ngModel]="c.status" (ngModelChange)="onStatusChange($event)" class="status-select">
                <option value="new">New</option>
                <option value="under_review">Under Review</option>
                <option value="documents_required">Documents Required</option>
                <option value="assessment">Assessment</option>
                <option value="in_progress">In Progress</option>
                <option value="awaiting_client">Awaiting Client</option>
                <option value="recovery_processing">Recovery Processing</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div class="stepper-track">
            @for (step of lifecycleSteps; track step.key; let idx = $index) {
              <div class="step-node" [class.completed]="isStepCompleted(c.status, step.key)" [class.current]="c.status === step.key">
                <div class="step-circle">{{ idx + 1 }}</div>
                <span class="step-name">{{ step.label }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Two Column Content Grid -->
        <div class="content-grid">
          <!-- Left: Case Details & Documents -->
          <div class="left-col">
            <!-- Case Info Card -->
            <div class="section-card">
              <h3>Case Docket & Overview</h3>
              <div class="info-grid">
                <div class="info-field">
                  <label>Court Docket / Ref #</label>
                  <span>{{ c.caseRefNumber || '34-2026-003891' }}</span>
                </div>
                <div class="info-field">
                  <label>Filing Date</label>
                  <span>{{ (c.filingDate | date:'mediumDate') || 'Pending Filing' }}</span>
                </div>
                <div class="info-field">
                  <label>Hearing Date</label>
                  <span>{{ (c.hearingDate | date:'mediumDate') || 'Awaiting Schedule' }}</span>
                </div>
                <div class="info-field">
                  <label>Lead Recovery Agent</label>
                  <span>{{ c.assignedAgentName }}</span>
                </div>
              </div>
              @if (c.description) {
                <div class="desc-box">
                  <label>Case Notes</label>
                  <p>{{ c.description }}</p>
                </div>
              }
            </div>

            <!-- Documents Section -->
            <div class="section-card">
              <div class="card-title-flex">
                <h3>Case Filings & Documents</h3>
                <span class="count-tag">{{ documents().length }} files</span>
              </div>

              <div class="docs-list">
                @for (doc of documents(); track doc.id) {
                  <div class="doc-item">
                    <span class="file-icon">📄</span>
                    <div class="doc-meta">
                      <strong>{{ doc.title }}</strong>
                      <span class="sub">{{ doc.fileName }} ({{ doc.fileSize }})</span>
                    </div>
                    <crm-status-badge [status]="doc.status" />
                    <button class="btn-dl" title="Download">⬇</button>
                  </div>
                } @empty {
                  <div class="empty">No documents linked to this case.</div>
                }
              </div>
            </div>
          </div>

          <!-- Right: Related Tasks & Timeline -->
          <div class="right-col">
            <!-- Tasks -->
            <div class="section-card">
              <div class="card-title-flex">
                <h3>Required Actions</h3>
                <span class="count-tag">{{ tasks().length }} tasks</span>
              </div>

              <div class="tasks-list">
                @for (t of tasks(); track t.id) {
                  <div class="task-entry">
                    <div class="task-title-row">
                      <span class="task-desc">{{ t.title }}</span>
                      <crm-status-badge [status]="t.priority" />
                    </div>
                    <span class="due">Due: {{ t.dueDate | date:'mediumDate' }}</span>
                  </div>
                } @empty {
                  <div class="empty">No pending actions.</div>
                }
              </div>
            </div>

            <!-- Audit Activity -->
            <div class="section-card">
              <h3>Activity Timeline</h3>
              <div class="timeline">
                @for (act of activities(); track act.id) {
                  <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <span class="act-action">{{ act.action }}</span>
                      <p class="act-details">{{ act.details }}</p>
                      <span class="act-time">{{ act.timestamp | date:'short' }} by {{ act.userName }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .detail-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .breadcrumb { font-size: 0.875rem; color: #64748B; display: flex; gap: 0.5rem; a { color: #2563EB; text-decoration: none; } }
    .hero-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 1.75rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .case-badge-row { display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.5rem; }
    .case-id-badge { font-family: monospace; font-weight: 700; font-size: 0.875rem; background: #0F172A; color: #38BDF8; padding: 2px 8px; border-radius: 4px; }
    .priority-tag { font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }
    .priority-tag.urgent { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
    .priority-tag.high { background: #FFFBEB; color: #D97706; border: 1px solid #FDE68A; }
    .hero-main h2 { margin: 0 0 0.35rem 0; font-size: 1.6rem; color: #0F172A; }
    .claimant-sub { margin: 0; color: #64748B; font-size: 0.9rem; }
    .financials-box { display: flex; gap: 1rem; }
    .fin-item {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 0.65rem 1.25rem;
      display: flex;
      flex-direction: column;
      .label { font-size: 0.75rem; color: #64748B; text-transform: uppercase; font-weight: 600; }
      .val { font-size: 1.25rem; font-weight: 700; color: #0F172A; }
      &.highlight { background: #EFF6FF; border-color: #BFDBFE; .fee { color: #1D4ED8; } }
    }

    /* Stepper */
    .stepper-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
    }
    .stepper-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      h4 { margin: 0; font-size: 1rem; color: #0F172A; }
    }
    .status-change-control {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      label { font-size: 0.8125rem; font-weight: 600; color: #475569; }
    }
    .status-select {
      padding: 0.4rem 0.75rem;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      font-size: 0.8125rem;
      font-weight: 600;
      background: #F8FAFC;
    }
    .stepper-track {
      display: flex;
      align-items: center;
      justify-content: space-between;
      overflow-x: auto;
      gap: 0.75rem;
      padding: 0.5rem 0;
    }
    .step-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      min-width: 80px;
      opacity: 0.4;
      &.completed {
        opacity: 1;
        .step-circle { background: #10B981; color: #FFF; border-color: #10B981; }
        .step-name { color: #059669; font-weight: 600; }
      }
      &.current {
        opacity: 1;
        .step-circle { background: #2563EB; color: #FFF; border-color: #2563EB; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2); }
        .step-name { color: #2563EB; font-weight: 700; }
      }
    }
    .step-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid #CBD5E1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748B;
      background: #FFFFFF;
    }
    .step-name { font-size: 0.6875rem; text-align: center; color: #64748B; }

    /* Content Grid */
    .content-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 1.25rem; @media (max-width: 1024px) { grid-template-columns: 1fr; } }
    .section-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.25rem;
      h3 { margin: 0 0 1rem 0; font-size: 1.05rem; color: #0F172A; }
    }
    .card-title-flex { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; h3 { margin: 0; } }
    .count-tag { font-size: 0.75rem; background: #F1F5F9; color: #475569; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .info-field {
      display: flex;
      flex-direction: column;
      gap: 2px;
      label { font-size: 0.75rem; color: #64748B; text-transform: uppercase; font-weight: 600; }
      span { font-size: 0.9rem; font-weight: 600; color: #0F172A; }
    }
    .desc-box { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #F1F5F9; label { font-size: 0.75rem; color: #64748B; font-weight: 600; text-transform: uppercase; } p { margin: 4px 0 0 0; font-size: 0.875rem; color: #334155; } }
    .docs-list { display: flex; flex-direction: column; gap: 0.65rem; }
    .doc-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem;
      border: 1px solid #F1F5F9;
      background: #F8FAFC;
      border-radius: 8px;
    }
    .file-icon { font-size: 1.25rem; }
    .doc-meta { flex: 1; display: flex; flex-direction: column; strong { font-size: 0.8125rem; color: #0F172A; } .sub { font-size: 0.7rem; color: #64748B; } }
    .btn-dl { background: #FFF; border: 1px solid #CBD5E1; border-radius: 4px; padding: 2px 6px; cursor: pointer; }
    .tasks-list { display: flex; flex-direction: column; gap: 0.65rem; }
    .task-entry { padding: 0.65rem; background: #F8FAFC; border: 1px solid #F1F5F9; border-radius: 8px; display: flex; flex-direction: column; gap: 2px; }
    .task-title-row { display: flex; justify-content: space-between; align-items: center; }
    .task-desc { font-size: 0.8125rem; font-weight: 600; color: #0F172A; }
    .due { font-size: 0.7rem; color: #64748B; }
    .timeline { display: flex; flex-direction: column; gap: 1rem; padding-left: 0.5rem; }
    .timeline-item { display: flex; gap: 0.75rem; position: relative; }
    .timeline-dot { width: 8px; height: 8px; border-radius: 50%; background: #2563EB; margin-top: 5px; flex-shrink: 0; }
    .act-action { font-size: 0.8125rem; font-weight: 600; color: #0F172A; display: block; }
    .act-details { margin: 2px 0 0 0; font-size: 0.75rem; color: #475569; }
    .act-time { font-size: 0.7rem; color: #94A3B8; }
    .empty { text-align: center; color: #94A3B8; font-size: 0.8125rem; padding: 1.5rem; }
  `]
})
export class CaseDetailComponent {
  private route = inject(ActivatedRoute);
  private caseService = inject(CrmCaseService);
  private docService = inject(DocumentService);
  private taskService = inject(TaskService);
  private actService = inject(ActivityService);
  private toastService = inject(ToastService);

  caseItem = signal<RecoveryCase | null>(null);
  documents = signal<CrmDocument[]>([]);
  tasks = signal<Task[]>([]);
  activities = signal<ActivityEvent[]>([]);

  readonly lifecycleSteps: { key: CaseStatus; label: string }[] = [
    { key: 'new', label: 'New' },
    { key: 'under_review', label: 'Review' },
    { key: 'documents_required', label: 'Docs' },
    { key: 'assessment', label: 'Assess' },
    { key: 'in_progress', label: 'Filing' },
    { key: 'awaiting_client', label: 'Hearing' },
    { key: 'recovery_processing', label: 'Disbursing' },
    { key: 'completed', label: 'Completed' }
  ];

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.caseService.getCaseById(id).subscribe(c => {
          if (c) {
            this.caseItem.set(c);
            this.docService.getDocumentsByCase(c.id).subscribe(docs => this.documents.set(docs));
            this.taskService.tasks$.subscribe(tasks => {
              this.tasks.set(tasks.filter(t => t.relatedCaseId === c.id || t.relatedCustomerId === c.customerId));
            });
            this.actService.activities$.subscribe(acts => {
              this.activities.set(acts);
            });
          }
        });
      }
    });
  }

  isStepCompleted(current: CaseStatus, stepKey: CaseStatus): boolean {
    const order = this.lifecycleSteps.map(s => s.key);
    const currIdx = order.indexOf(current);
    const stepIdx = order.indexOf(stepKey);
    return currIdx > stepIdx;
  }

  onStatusChange(newStatus: CaseStatus): void {
    const c = this.caseItem();
    if (!c) return;
    this.caseService.updateStatus(c.id, newStatus).subscribe(updated => {
      if (updated) {
        this.caseItem.set(updated);
        this.toastService.success(`Case status updated to ${newStatus.replace(/_/g, ' ')}`);
      }
    });
  }
}
