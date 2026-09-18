import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { Task, TaskPriority, TaskType } from '../../../core/models/task.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'crm-admin-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Staff Task Management</h2>
          <p class="subtitle">Assign and monitor daily action items across all case managers and recovery officers.</p>
        </div>
        <button class="btn-create" (click)="openCreateModal()">+ Create Task</button>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="filter-tabs">
          <button [class.active]="statusFilter() === 'all'" (click)="statusFilter.set('all')">All</button>
          <button [class.active]="statusFilter() === 'pending'" (click)="statusFilter.set('pending')">Pending</button>
          <button [class.active]="statusFilter() === 'in_progress'" (click)="statusFilter.set('in_progress')">In Progress</button>
          <button [class.active]="statusFilter() === 'completed'" (click)="statusFilter.set('completed')">Completed</button>
        </div>
      </div>

      <!-- Tasks List Table -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th width="40"></th>
                <th>Task Title</th>
                <th>Category</th>
                <th>Related Customer / Case</th>
                <th>Priority</th>
                <th>Assigned Agent</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (t of filteredTasks(); track t.id) {
                <tr [class.completed-row]="t.status === 'completed'">
                  <td>
                    <div class="checkbox" (click)="toggleTask(t.id)">
                      @if (t.status === 'completed') { <img class="real-icon real-icon-inline" src="/assets/icons/verified-stamp.png" alt="" aria-hidden="true" /> }
                    </div>
                  </td>
                  <td>
                    <strong class="task-title-text">{{ t.title }}</strong>
                    @if (t.description) {
                      <p class="task-desc-sub">{{ t.description }}</p>
                    }
                  </td>
                  <td><span class="type-tag">{{ formatType(t.type) }}</span></td>
                  <td>
                    @if (t.relatedCustomerName) {
                      <span>{{ t.relatedCustomerName }}</span>
                      @if (t.relatedCaseNumber) {
                        <span class="case-sub">({{ t.relatedCaseNumber }})</span>
                      }
                    } @else {
                      <span class="text-muted">—</span>
                    }
                  </td>
                  <td><crm-status-badge [status]="t.priority" /></td>
                  <td>{{ t.assignedAgentName }}</td>
                  <td class="due-cell">{{ t.dueDate | date:'mediumDate' }}</td>
                  <td><crm-status-badge [status]="t.status" /></td>
                </tr>
              } @empty {
                <tr><td colspan="8" class="empty">No tasks found.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create Task Modal -->
      @if (isCreateModalOpen()) {
        <div class="modal-overlay" (click)="isCreateModalOpen.set(false)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Create New Task</h3>
              <button class="close-btn" (click)="isCreateModalOpen.set(false)"><img class="real-icon real-icon-inline" src="/assets/icons/close-seal.png" alt="" aria-hidden="true" /></button>
            </div>
            <form (ngSubmit)="submitCreateTask()" class="modal-form">
              <div class="form-group">
                <label>Task Title</label>
                <input type="text" [(ngModel)]="newTask.title" name="title" required class="input-ctrl" />
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea [(ngModel)]="newTask.description" name="description" rows="2" class="input-ctrl"></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Type</label>
                  <select [(ngModel)]="newTask.type" name="type" class="input-ctrl">
                    <option value="call">Call Client / Court</option>
                    <option value="document_review">Document Review</option>
                    <option value="court_filing">Court Filing</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="intake">Intake</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Priority</label>
                  <select [(ngModel)]="newTask.priority" name="priority" class="input-ctrl">
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Assignee</label>
                  <select [(ngModel)]="newTask.assignedAgentName" name="assignedAgentName" class="input-ctrl">
                    <option value="Marcus Vance">Marcus Vance</option>
                    <option value="Elena Rostova">Elena Rostova</option>
                    <option value="David Sterling">David Sterling</option>
                    <option value="Sarah Jenkins">Sarah Jenkins</option>
                    <option value="Robert Chen">Robert Chen</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Due Date</label>
                  <input type="date" [(ngModel)]="newTask.dueDate" name="dueDate" class="input-ctrl" />
                </div>
              </div>
              <div class="form-actions">
                <button type="button" class="btn-cancel" (click)="isCreateModalOpen.set(false)">Cancel</button>
                <button type="submit" class="btn-save">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; h2 { font-size: 1.65rem; color: #0F172A; margin: 0 0 0.25rem 0; } .subtitle { color: #64748B; font-size: 0.925rem; margin: 0; } }
    .btn-create { background: #2563EB; color: #FFF; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; }
    .filters-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 0.75rem 1.25rem; display: flex; }
    .filter-tabs { display: flex; gap: 0.5rem; button { padding: 0.4rem 0.85rem; border-radius: 6px; font-size: 0.8125rem; font-weight: 600; color: #64748B; cursor: pointer; &.active { background: #EFF6FF; color: #2563EB; } } }
    .table-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; }
    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; th { padding: 0.75rem; color: #64748B; font-weight: 600; text-align: left; border-bottom: 1px solid #E2E8F0; } td { padding: 0.85rem; border-bottom: 1px solid #F1F5F9; color: #334155; } }
    .completed-row { opacity: 0.6; .task-title-text { text-decoration: line-through; } }
    .checkbox { width: 20px; height: 20px; border: 2px solid #CBD5E1; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem; font-weight: 800; color: #2563EB; &:hover { border-color: #2563EB; } }
    .task-desc-sub { margin: 2px 0 0 0; font-size: 0.75rem; color: #64748B; }
    .type-tag { font-size: 0.75rem; background: #F1F5F9; color: #475569; padding: 2px 6px; border-radius: 4px; }
    .case-sub { font-size: 0.75rem; color: #64748B; margin-left: 4px; font-family: monospace; }
    .due-cell { font-size: 0.8125rem; color: #64748B; }
    .empty { text-align: center; color: #94A3B8; padding: 2rem; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 1050; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .modal-card { background: #FFF; border-radius: 16px; width: 100%; max-width: 520px; overflow: hidden; }
    .modal-header { padding: 1.25rem 1.5rem; background: #0F172A; color: #FFF; display: flex; justify-content: space-between; align-items: center; h3 { margin: 0; color: #FFF; } .close-btn { background: none; border: none; color: #94A3B8; font-size: 1.25rem; cursor: pointer; } }
    .modal-form { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; label { font-size: 0.8125rem; font-weight: 600; color: #475569; } }
    .input-ctrl { padding: 0.65rem 0.85rem; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 0.875rem; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }
    .btn-cancel { padding: 0.65rem 1.25rem; border: 1px solid #CBD5E1; background: #FFF; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-save { padding: 0.65rem 1.25rem; background: #2563EB; color: #FFF; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
  `]
})
export class AdminTasksComponent {
  private taskService = inject(TaskService);
  private toastService = inject(ToastService);

  statusFilter = signal<string>('all');
  allTasks = signal<Task[]>([]);

  isCreateModalOpen = signal<boolean>(false);
  newTask = {
    title: '',
    description: '',
    type: 'call' as TaskType,
    priority: 'high' as TaskPriority,
    assignedAgentName: 'Marcus Vance',
    dueDate: '2026-09-22'
  };

  constructor() {
    this.taskService.tasks$.subscribe(tasks => {
      this.allTasks.set(tasks);
    });
  }

  readonly filteredTasks = computed(() => {
    const filter = this.statusFilter();
    if (filter === 'all') return this.allTasks();
    return this.allTasks().filter(t => t.status === filter);
  });

  toggleTask(id: string): void {
    this.taskService.toggleComplete(id).subscribe(() => {
      this.toastService.info('Task status updated');
    });
  }

  formatType(type: TaskType): string {
    return type.replace(/_/g, ' ');
  }

  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
  }

  submitCreateTask(): void {
    this.taskService.createTask({
      title: this.newTask.title,
      description: this.newTask.description,
      type: this.newTask.type,
      priority: this.newTask.priority,
      status: 'pending',
      assignedAgentId: 'agent-1',
      assignedAgentName: this.newTask.assignedAgentName,
      dueDate: new Date(this.newTask.dueDate).toISOString()
    }).subscribe(() => {
      this.toastService.success('Task created!');
      this.isCreateModalOpen.set(false);
    });
  }
}
