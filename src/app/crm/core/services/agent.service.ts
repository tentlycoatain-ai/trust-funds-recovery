import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Agent } from '../models/agent.model';
import { MOCK_AGENTS } from '../mock-data/mock-db';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private agentsSubject = new BehaviorSubject<Agent[]>([...MOCK_AGENTS]);
  readonly agents$: Observable<Agent[]> = this.agentsSubject.asObservable();

  get agents(): Agent[] {
    return this.agentsSubject.value;
  }

  getAgents(): Observable<Agent[]> {
    return this.agents$;
  }

  getAgentById(id: string): Observable<Agent | undefined> {
    return this.agents$.pipe(
      map(agents => agents.find(a => a.id === id || a.employeeId.toLowerCase() === id.toLowerCase()))
    );
  }

  createAgent(data: Omit<Agent, 'id' | 'employeeId'>): Observable<Agent> {
    const nextNum = String(this.agentsSubject.value.length + 1).padStart(3, '0');
    const newAgent: Agent = {
      ...data,
      id: `agent-${Date.now()}`,
      employeeId: `TFR-AGT-${nextNum}`
    };

    const updated = [newAgent, ...this.agentsSubject.value];
    this.agentsSubject.next(updated);
    return of(newAgent);
  }

  updateAgent(id: string, changes: Partial<Agent>): Observable<Agent | undefined> {
    const list = [...this.agentsSubject.value];
    const index = list.findIndex(a => a.id === id);
    if (index === -1) return of(undefined);

    const updatedAgent = { ...list[index], ...changes };
    list[index] = updatedAgent;
    this.agentsSubject.next(list);
    return of(updatedAgent);
  }

  deleteAgent(id: string): Observable<boolean> {
    const list = this.agentsSubject.value.filter(a => a.id !== id);
    this.agentsSubject.next(list);
    return of(true);
  }
}
