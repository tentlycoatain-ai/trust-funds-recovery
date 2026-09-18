import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Payment } from '../models/payment.model';
import { MOCK_PAYMENTS } from '../mock-data/mock-db';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private paymentsSubject = new BehaviorSubject<Payment[]>([...MOCK_PAYMENTS]);
  readonly payments$: Observable<Payment[]> = this.paymentsSubject.asObservable();

  getPayments(): Observable<Payment[]> {
    return this.payments$;
  }

  getPaymentById(id: string): Observable<Payment | undefined> {
    return this.payments$.pipe(
      map(payments => payments.find(p => p.id === id || p.referenceNumber.toLowerCase() === id.toLowerCase()))
    );
  }

  getPaymentsByCase(caseId: string): Observable<Payment[]> {
    return this.payments$.pipe(
      map(payments => payments.filter(p => p.caseId === caseId))
    );
  }

  getPaymentsByCustomer(customerId: string): Observable<Payment[]> {
    return this.payments$.pipe(
      map(payments => payments.filter(p => p.customerId === customerId))
    );
  }

  createPayment(data: Omit<Payment, 'id' | 'referenceNumber' | 'date'>): Observable<Payment> {
    const nextNum = 4000 + this.paymentsSubject.value.length + 1;
    const newPayment: Payment = {
      ...data,
      id: `pay-${Date.now()}`,
      referenceNumber: `PAY-${nextNum}`,
      date: new Date().toISOString()
    };

    const updated = [newPayment, ...this.paymentsSubject.value];
    this.paymentsSubject.next(updated);
    return of(newPayment);
  }

  updatePayment(id: string, changes: Partial<Payment>): Observable<Payment | undefined> {
    const list = [...this.paymentsSubject.value];
    const index = list.findIndex(p => p.id === id);
    if (index === -1) return of(undefined);

    const updated = { ...list[index], ...changes };
    list[index] = updated;
    this.paymentsSubject.next(list);
    return of(updated);
  }
}
