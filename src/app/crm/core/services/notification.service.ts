import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CrmNotification } from '../models/notification.model';
import { MOCK_NOTIFICATIONS } from '../mock-data/mock-db';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifsSubject = new BehaviorSubject<CrmNotification[]>([...MOCK_NOTIFICATIONS]);
  readonly notifications$: Observable<CrmNotification[]> = this.notifsSubject.asObservable();

  readonly unreadCount$: Observable<number> = this.notifications$.pipe(
    map(list => list.filter(n => !n.read).length)
  );

  getNotifications(userId?: string): Observable<CrmNotification[]> {
    return this.notifications$.pipe(
      map(list => {
        if (!userId) return list;
        return list.filter(n => n.userId === 'all' || n.userId === userId || (userId === 'admin' && n.userId === 'admin'));
      })
    );
  }

  markAsRead(id: string): void {
    const list = this.notifsSubject.value.map(n => n.id === id ? { ...n, read: true } : n);
    this.notifsSubject.next(list);
  }

  markAllAsRead(): void {
    const list = this.notifsSubject.value.map(n => ({ ...n, read: true }));
    this.notifsSubject.next(list);
  }

  clearAll(): void {
    this.notifsSubject.next([]);
  }

  get notifications(): CrmNotification[] {
    return this.notifsSubject.value;
  }

  addNotification(data: Omit<CrmNotification, 'id' | 'timestamp' | 'read'>): void {
    const newNotif: CrmNotification = {
      ...data,
      id: `notif-${Date.now()}`,
      read: false,
      timestamp: new Date().toISOString()
    };
    this.notifsSubject.next([newNotif, ...this.notifsSubject.value]);
  }
}
