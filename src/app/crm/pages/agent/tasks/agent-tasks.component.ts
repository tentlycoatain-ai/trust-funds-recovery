import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Task, TaskPriority, TaskType } from '../../../core/models/task.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'crm-agent-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">My Daily Tasks & Follow-ups</h1>
          <p class="page-subtitle">Action items, court filing deadlines, claimant verifications, and callback reminders</p>
        </div>
        <button class="btn-primary" (click)="showNewTaskModal = true">
          <img class="real-icon real-icon-inline" src="/assets/icons/phone-handset.png" alt="" aria-hidden="true" />
          Add Task
        </button>
      </div>

      <!-- Quick Metrics -->
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="m-val">{{ pendingCount() }}</span>
          <span class="m-lbl">Pending Tasks</span>
        </div>
        <div class="metric-card">
          <span class="m-val urgent">{{ urgentCount() }}</span>
          <span class="m-lbl">Urgent / High</span>
        </div>
        <div class="metric-card">
          <span class="m-val completed">{{ completedCount() }}</span>
          <span class="m-lbl">Completed</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <div class="filter-tabs">
          <button [class.active]="filterStatus() === 'all'" (click)="filterStatus.set('all')">All Tasks</button>
          <button [class.active]="filterStatus() === 'pending'" (click)="filterStatus.set('pending')">Pending</button>
          <button [class.active]="filterStatus() === 'completed'" (click)="filterStatus.set('completed')">Completed</button>
        </div>

        <div class="search-box">
          <img class="real-icon real-icon-inline" src="/assets/icons/coin-stack.png" alt="" aria-hidden="true" />
          <input type="text" [(ngModel)]="searchQuery" placeholder="Filter tasks by title or case..." class="search-input" />
        </div>
      </div>

      <!-- Task List -->
      <div class="tasks-list">
        @for (task of filteredTasks(); track task.id) {
          <div class="task-card" [class.is-done]="task.status === 'completed'">
            <button class="check-btn" (click)="toggleTask(task)" [title]="task.status === 'completed' ? 'Mark Pending' : 'Mark Completed'">
              <div class="check-circle" [class.checked]="task.status === 'completed'">
                @if (task.status === 'completed') {
                  <img class="real-icon real-icon-inline" src="/assets/icons/coin-stack.png" alt="" aria-hidden="true" />
                }
              </div>
            </button>

            <div class="task-content">
              <div class="task-top">
                <span class="task-title" [class.line-through]="task.status === 'completed'">{{ task.title }}</span>
                <span class="prio-tag" [class]="'prio-' + task.priority">{{ task.priority | uppercase }}</span>
              </div>

              @if (task.description) {
                <p class="task-desc">{{ task.description }}</p>
              }

              <div class="task-footer">
                @if (task.dueDate) {
                  <span class="due-date">
                    <img class="real-icon real-icon-inline" src="/assets/icons/calendar-desk.png" alt="" aria-hidden="true" />
                    Due: {{ task.dueDate }}
                  </span>
                }
                @if (task.relatedCaseNumber) {
                  <span class="badge-case">Case {{ task.relatedCaseNumber }}</span>
                }
                @if (task.relatedCustomerName) {
                  <span class="badge-cust">{{ task.relatedCustomerName }}</span>
                }
              </div>
            </div>

            <button class="del-btn" (click)="deleteTask(task.id)" title="Delete Task">
              <img class="real-icon real-icon-inline" src="/assets/icons/coin-stack.png" alt="" aria-hidden="true" />
            </button>
          </div>
        } @empty {
          <div class="empty-state">
            <img class="real-icon real-icon-inline" src="/assets/icons/coin-stack.png" alt="" aria-hidden="true" />
            <p>No tasks found in this view.</p>
          </div>
        }
      </div>

      <!-- Quick New Task Modal -->
      @if (showNewTaskModal) {
        <div class="modal-backdrop">
          <div class="modal-card">
            <div class="modal-header">
              <h3>Create New Follow-up Task</h3>
              <button class="close-btn" (click)="showNewTaskModal = false"><img class="real-icon real-icon-inline" src="/assets/icons/close-seal.png" alt="" aria-hidden="true" /></button>
            </div>
            <div class="modal-body">
              <label class="input-lbl">Task Title</label>
              <input type="text" [(ngModel)]="newTaskTitle" placeholder="e.g. Call County Clerk for status confirmation" class="modal-input" />

              <label class="input-lbl">Description / Notes</label>
              <textarea [(ngModel)]="newTaskDesc" placeholder="Details or requirements..." class="modal-textarea" rows="3"></textarea>

              <div class="form-row">
                <div class="form-col">
                  <label class="input-lbl">Priority</label>
                  <select [(ngModel)]="newTaskPriority" class="modal-select">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div class="form-col">
                  <label class="input-lbl">Due Date</label>
                  <input type="date" [(ngModel)]="newTaskDueDate" class="modal-input" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" (click)="showNewTaskModal = false">Cancel</button>
              <button class="btn-primary" (click)="createTask()" [disabled]="!newTaskTitle.trim()">Save Task</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; max-width: 900px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 700; color: var(--crm-text-primary); margin: 0 0 4px; }
    .page-subtitle { font-size: 14px; color: var(--crm-text-secondary); margin: 0; }
    .btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: var(--crm-accent); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; }
    .metric-card { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 12px; padding: 14px 18px; display: flex; flex-direction: column; align-items: center; }
    .metric-card .m-val { font-size: 22px; font-weight: 700; color: var(--crm-text-primary); }
    .metric-card .m-val.urgent { color: #dc2626; }
    .metric-card .m-val.completed { color: #16a34a; }
    .metric-card .m-lbl { font-size: 11px; text-transform: uppercase; font-weight: 600; color: var(--crm-text-muted); margin-top: 2px; }
    .filter-bar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .filter-tabs { display: flex; gap: 6px; }
    .filter-tabs button { border: 1px solid var(--crm-border); background: var(--crm-surface); color: var(--crm-text-secondary); font-size: 13px; font-weight: 500; padding: 6px 14px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
    .filter-tabs button.active { background: var(--crm-accent); color: white; border-color: var(--crm-accent); }
    .search-box { display: flex; align-items: center; gap: 8px; background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 8px; padding: 8px 12px; flex: 1; max-width: 320px; }
    .search-input { border: none; background: transparent; outline: none; font-size: 13px; color: var(--crm-text-primary); width: 100%; }
    .tasks-list { display: flex; flex-direction: column; gap: 10px; }
    .task-card { display: flex; align-items: flex-start; gap: 14px; background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 12px; padding: 16px; transition: border-color 0.2s; }
    .task-card:hover { border-color: rgba(59,130,246,0.3); }
    .task-card.is-done { opacity: 0.7; background: var(--crm-surface-2); }
    .check-btn { background: none; border: none; padding: 0; cursor: pointer; margin-top: 2px; }
    .check-circle { width: 22px; height: 22px; border-radius: 6px; border: 2px solid var(--crm-border); display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
    .check-circle.checked { background: #16a34a; border-color: #16a34a; color: white; }
    .task-content { flex: 1; min-width: 0; }
    .task-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 8px; }
    .task-title { font-size: 14px; font-weight: 600; color: var(--crm-text-primary); }
    .task-title.line-through { text-decoration: line-through; color: var(--crm-text-muted); }
    .prio-tag { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
    .prio-urgent { background: #fee2e2; color: #dc2626; }
    .prio-high { background: #ffedd5; color: #ea580c; }
    .prio-medium { background: #eff6ff; color: #2563eb; }
    .prio-low { background: #f3f4f6; color: #6b7280; }
    .task-desc { font-size: 13px; color: var(--crm-text-secondary); margin: 0 0 8px; line-height: 1.4; }
    .task-footer { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .due-date { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--crm-text-muted); font-weight: 500; }
    .badge-case { font-size: 11px; font-family: monospace; background: rgba(59,130,246,0.08); color: var(--crm-accent); padding: 2px 6px; border-radius: 4px; font-weight: 600; }
    .badge-cust { font-size: 11px; background: var(--crm-surface-2); color: var(--crm-text-secondary); padding: 2px 6px; border-radius: 4px; }
    .del-btn { background: none; border: none; color: var(--crm-text-muted); cursor: pointer; padding: 4px; border-radius: 4px; transition: color 0.15s; }
    .del-btn:hover { color: #dc2626; }
    .empty-state { text-align: center; padding: 60px 20px; color: var(--crm-text-muted); }
    .empty-state svg { opacity: 0.4; margin-bottom: 12px; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 20px; }
    .modal-card { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 16px; width: 100%; max-width: 480px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-bottom: 1px solid var(--crm-border); }
    .modal-header h3 { font-size: 16px; font-weight: 700; color: var(--crm-text-primary); margin: 0; }
    .close-btn { background: none; border: none; font-size: 16px; color: var(--crm-text-muted); cursor: pointer; }
    .modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 12px; }
    .input-lbl { font-size: 12px; font-weight: 600; color: var(--crm-text-secondary); }
    .modal-input, .modal-select, .modal-textarea { border: 1px solid var(--crm-border); border-radius: 8px; background: var(--crm-surface-2); padding: 9px 12px; font-size: 13px; color: var(--crm-text-primary); outline: none; width: 100%; box-sizing: border-box; }
    .form-row { display: flex; gap: 12px; }
    .form-col { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--crm-border); background: var(--crm-surface-2); }
    .btn-cancel { background: none; border: 1px solid var(--crm-border); border-radius: 8px; padding: 8px 16px; font-size: 13px; color: var(--crm-text-secondary); cursor: pointer; }
  `]
})
export class AgentTasksComponent {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  private allTasks = toSignal(this.taskService.tasks$, { initialValue: [] });

  filterStatus = signal<'all' | 'pending' | 'completed'>('all');
  searchQuery = '';

  showNewTaskModal = false;
  newTaskTitle = '';
  newTaskDesc = '';
  newTaskPriority: TaskPriority = 'medium';
  newTaskDueDate = '';

  myTasks = computed(() => {
    const agentId = this.authService.currentUser()?.agentId || 'agent-1';
    const list = this.allTasks();
    const assigned = list.filter(t => t.assignedAgentId === agentId);
    return assigned.length > 0 ? assigned : list;
  });

  filteredTasks = computed(() => {
    const status = this.filterStatus();
    const query = this.searchQuery.toLowerCase().trim();

    return this.myTasks().filter(t => {
      const matchesStatus = status === 'all' || 
        (status === 'completed' ? t.status === 'completed' : t.status !== 'completed');
      const matchesQuery = !query || 
        t.title.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query)) ||
        (t.relatedCaseNumber && t.relatedCaseNumber.toLowerCase().includes(query));

      return matchesStatus && matchesQuery;
    });
  });

  pendingCount = computed(() => this.myTasks().filter(t => t.status !== 'completed').length);
  urgentCount = computed(() => this.myTasks().filter(t => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed').length);
  completedCount = computed(() => this.myTasks().filter(t => t.status === 'completed').length);

  toggleTask(task: Task) {
    this.taskService.toggleComplete(task.id).subscribe(() => {
      const state = task.status === 'completed' ? 'pending' : 'completed';
      this.toastService.show(`Task marked ${state}`, 'info');
    });
  }

  deleteTask(id: string) {
    this.taskService.deleteTask(id).subscribe(() => {
      this.toastService.show('Task removed', 'warning');
    });
  }

  createTask() {
    if (!this.newTaskTitle.trim()) return;
    const current = this.authService.currentUser();
    this.taskService.createTask({
      title: this.newTaskTitle.trim(),
      description: this.newTaskDesc.trim(),
      priority: this.newTaskPriority,
      status: 'pending',
      type: 'follow_up',
      assignedAgentId: current?.agentId || 'agent-1',
      assignedAgentName: current?.name || 'Marcus Vance',
      dueDate: this.newTaskDueDate || new Date().toISOString().split('T')[0]
    }).subscribe(() => {
      this.toastService.show('New task scheduled', 'success');
      this.showNewTaskModal = false;
      this.newTaskTitle = '';
      this.newTaskDesc = '';
      this.newTaskPriority = 'medium';
      this.newTaskDueDate = '';
    });
  }
}
