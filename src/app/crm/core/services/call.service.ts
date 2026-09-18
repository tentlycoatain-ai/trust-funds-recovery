import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Call } from '../models/call.model';
import { MOCK_CALLS } from '../mock-data/mock-db';

@Injectable({
  providedIn: 'root'
})
export class CallService {
  private callsSubject = new BehaviorSubject<Call[]>([...MOCK_CALLS]);
  readonly calls$: Observable<Call[]> = this.callsSubject.asObservable();

  get calls(): Call[] {
    return this.callsSubject.value;
  }

  getCalls(): Observable<Call[]> {
    return this.calls$;
  }

  getCallsByAgent(agentId: string): Observable<Call[]> {
    return this.calls$.pipe(
      map(calls => calls.filter(c => c.agentId === agentId))
    );
  }

  getCallsByCustomer(customerId: string): Observable<Call[]> {
    return this.calls$.pipe(
      map(calls => calls.filter(c => c.customerId === customerId))
    );
  }

  logCall(data: Omit<Call, 'id' | 'timestamp' | 'maskedPhoneNumber'> & { realPhoneNumber: string }): Observable<Call> {
    const newCall: Call = {
      ...data,
      id: `call-${Date.now()}`,
      maskedPhoneNumber: this.maskPhoneNumber(data.realPhoneNumber),
      timestamp: new Date().toISOString()
    };

    const updated = [newCall, ...this.callsSubject.value];
    this.callsSubject.next(updated);
    return of(newCall);
  }

  maskPhoneNumber(phone: string): string {
    if (!phone) return '+1 (***) ***-****';
    const digits = phone.replace(/\D/g, '');
    const lastFour = digits.slice(-4) || '0000';
    return `+1 (***) ***-${lastFour}`;
  }
}
