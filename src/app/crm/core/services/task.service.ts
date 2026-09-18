import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task, TaskStatus } from '../models/task.model';
import { MOCK_TASKS } from '../mock-data/mock-db';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([...MOCK_TASKS]);
  readonly tasks$: Observable<Task[]> = this.tasksSubject.asObservable();

  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  getTaskById(id: string): Observable<Task | undefined> {
    return this.tasks$.pipe(
      map(tasks => tasks.find(t => t.id === id))
    );
  }

  getTasksByAgent(agentId: string): Observable<Task[]> {
    return this.tasks$.pipe(
      map(tasks => tasks.filter(t => t.assignedAgentId === agentId))
    );
  }

  createTask(data: Omit<Task, 'id' | 'dateCreated'>): Observable<Task> {
    const newTask: Task = {
      ...data,
      id: `task-${Date.now()}`,
      dateCreated: new Date().toISOString()
    };

    const updated = [newTask, ...this.tasksSubject.value];
    this.tasksSubject.next(updated);
    return of(newTask);
  }

  updateTask(id: string, changes: Partial<Task>): Observable<Task | undefined> {
    const list = [...this.tasksSubject.value];
    const index = list.findIndex(t => t.id === id);
    if (index === -1) return of(undefined);

    const updatedTask = { ...list[index], ...changes };
    list[index] = updatedTask;
    this.tasksSubject.next(list);
    return of(updatedTask);
  }

  toggleComplete(id: string): Observable<Task | undefined> {
    const task = this.tasksSubject.value.find(t => t.id === id);
    if (!task) return of(undefined);

    const isCompleted = task.status === 'completed';
    const newStatus: TaskStatus = isCompleted ? 'pending' : 'completed';
    const completedDate = isCompleted ? undefined : new Date().toISOString();

    return this.updateTask(id, { status: newStatus, completedDate });
  }

  deleteTask(id: string): Observable<boolean> {
    const list = this.tasksSubject.value.filter(t => t.id !== id);
    this.tasksSubject.next(list);
    return of(true);
  }
}
