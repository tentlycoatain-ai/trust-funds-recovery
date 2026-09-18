import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Customer } from '../models/customer.model';
import { MOCK_CUSTOMERS } from '../mock-data/mock-db';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private customersSubject = new BehaviorSubject<Customer[]>([...MOCK_CUSTOMERS]);
  readonly customers$: Observable<Customer[]> = this.customersSubject.asObservable();

  get customers(): Customer[] {
    return this.customersSubject.value;
  }

  getCustomers(): Observable<Customer[]> {
    return this.customers$;
  }

  getCustomerById(id: string): Observable<Customer | undefined> {
    return this.customers$.pipe(
      map(customers => customers.find(c => c.id === id || c.customerNumber.toLowerCase() === id.toLowerCase()))
    );
  }

  getCustomersByAgent(agentId: string): Observable<Customer[]> {
    return this.customers$.pipe(
      map(customers => customers.filter(c => c.assignedAgentId === agentId))
    );
  }

  createCustomer(data: Omit<Customer, 'id' | 'customerNumber' | 'maskedPhone' | 'dateAdded'> & { phone: string }): Observable<Customer> {
    const nextNum = 1000 + this.customersSubject.value.length + 1;
    const newCustomer: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      customerNumber: `CUST-${nextNum}`,
      maskedPhone: this.maskPhoneNumber(data.phone),
      activeCasesCount: data.activeCasesCount ?? 0,
      totalCasesCount: data.totalCasesCount ?? 0,
      totalRecoveredAmount: data.totalRecoveredAmount ?? 0,
      dateAdded: new Date().toISOString()
    };

    const updated = [newCustomer, ...this.customersSubject.value];
    this.customersSubject.next(updated);
    return of(newCustomer);
  }

  updateCustomer(id: string, changes: Partial<Customer>): Observable<Customer | undefined> {
    const list = [...this.customersSubject.value];
    const index = list.findIndex(c => c.id === id);
    if (index === -1) return of(undefined);

    const updatedCust = {
      ...list[index],
      ...changes,
      ...(changes.phone ? { maskedPhone: this.maskPhoneNumber(changes.phone) } : {})
    };
    list[index] = updatedCust;
    this.customersSubject.next(list);
    return of(updatedCust);
  }

  deleteCustomer(id: string): Observable<boolean> {
    const list = this.customersSubject.value.filter(c => c.id !== id);
    this.customersSubject.next(list);
    return of(true);
  }

  maskPhoneNumber(phone: string): string {
    if (!phone) return '+1 (***) ***-****';
    const digits = phone.replace(/\D/g, '');
    const lastFour = digits.slice(-4) || '0000';
    return `+1 (***) ***-${lastFour}`;
  }
}
