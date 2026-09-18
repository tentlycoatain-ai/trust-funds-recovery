import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RecoveryCase, CaseStatus } from '../models/case.model';
import { MOCK_CASES } from '../mock-data/mock-db';

@Injectable({
  providedIn: 'root'
})
export class CrmCaseService {
  private casesSubject = new BehaviorSubject<RecoveryCase[]>([...MOCK_CASES]);
  readonly cases$: Observable<RecoveryCase[]> = this.casesSubject.asObservable();

  getCases(): Observable<RecoveryCase[]> {
    return this.cases$;
  }

  getCaseById(id: string): Observable<RecoveryCase | undefined> {
    return this.cases$.pipe(
      map(cases => cases.find(c => c.id === id || c.caseNumber.toLowerCase() === id.toLowerCase()))
    );
  }

  getCasesByCustomer(customerId: string): Observable<RecoveryCase[]> {
    return this.cases$.pipe(
      map(cases => cases.filter(c => c.customerId === customerId))
    );
  }

  getCasesByAgent(agentId: string): Observable<RecoveryCase[]> {
    return this.cases$.pipe(
      map(cases => cases.filter(c => c.assignedAgentId === agentId))
    );
  }

  createCase(data: Omit<RecoveryCase, 'id' | 'caseNumber' | 'dateCreated' | 'lastUpdated'>): Observable<RecoveryCase> {
    const nextNum = 5000 + this.casesSubject.value.length + 1;
    const now = new Date().toISOString();
    const newCase: RecoveryCase = {
      ...data,
      id: `case-${Date.now()}`,
      caseNumber: `TRF-${nextNum}`,
      dateCreated: now,
      lastUpdated: now
    };

    const updated = [newCase, ...this.casesSubject.value];
    this.casesSubject.next(updated);
    return of(newCase);
  }

  updateCase(id: string, changes: Partial<RecoveryCase>): Observable<RecoveryCase | undefined> {
    const list = [...this.casesSubject.value];
    const index = list.findIndex(c => c.id === id);
    if (index === -1) return of(undefined);

    const updatedCase = {
      ...list[index],
      ...changes,
      lastUpdated: new Date().toISOString()
    };
    list[index] = updatedCase;
    this.casesSubject.next(list);
    return of(updatedCase);
  }

  updateStatus(id: string, status: CaseStatus): Observable<RecoveryCase | undefined> {
    return this.updateCase(id, { status });
  }

  deleteCase(id: string): Observable<boolean> {
    const list = this.casesSubject.value.filter(c => c.id !== id);
    this.casesSubject.next(list);
    return of(true);
  }
}
