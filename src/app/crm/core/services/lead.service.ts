import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Lead, LeadStage } from '../models/lead.model';
import { MOCK_LEADS } from '../mock-data/mock-db';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private leadsSubject = new BehaviorSubject<Lead[]>([...MOCK_LEADS]);
  readonly leads$: Observable<Lead[]> = this.leadsSubject.asObservable();

  getLeads(): Observable<Lead[]> {
    return this.leads$;
  }

  getLeadById(id: string): Observable<Lead | undefined> {
    return this.leads$.pipe(
      map(leads => leads.find(l => l.id === id || l.leadNumber.toLowerCase() === id.toLowerCase()))
    );
  }

  getLeadsByAgent(agentId: string): Observable<Lead[]> {
    return this.leads$.pipe(
      map(leads => leads.filter(l => l.assignedAgentId === agentId))
    );
  }

  createLead(data: Omit<Lead, 'id' | 'leadNumber' | 'maskedPhone' | 'dateAdded'> & { phone: string }): Observable<Lead> {
    const nextNum = 2000 + this.leadsSubject.value.length + 1;
    const newLead: Lead = {
      ...data,
      id: `lead-${Date.now()}`,
      leadNumber: `LEAD-${nextNum}`,
      maskedPhone: this.maskPhoneNumber(data.phone),
      dateAdded: new Date().toISOString()
    };

    const updated = [newLead, ...this.leadsSubject.value];
    this.leadsSubject.next(updated);
    return of(newLead);
  }

  updateLead(id: string, changes: Partial<Lead>): Observable<Lead | undefined> {
    const list = [...this.leadsSubject.value];
    const index = list.findIndex(l => l.id === id);
    if (index === -1) return of(undefined);

    const updatedLead = {
      ...list[index],
      ...changes,
      ...(changes.phone ? { maskedPhone: this.maskPhoneNumber(changes.phone) } : {})
    };
    list[index] = updatedLead;
    this.leadsSubject.next(list);
    return of(updatedLead);
  }

  updateStage(id: string, stage: LeadStage): Observable<Lead | undefined> {
    return this.updateLead(id, { stage });
  }

  deleteLead(id: string): Observable<boolean> {
    const list = this.leadsSubject.value.filter(l => l.id !== id);
    this.leadsSubject.next(list);
    return of(true);
  }

  maskPhoneNumber(phone: string): string {
    if (!phone) return '+1 (***) ***-****';
    const digits = phone.replace(/\D/g, '');
    const lastFour = digits.slice(-4) || '0000';
    return `+1 (***) ***-${lastFour}`;
  }
}
