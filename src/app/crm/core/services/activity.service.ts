import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivityEvent } from '../models/activity.model';
import { MOCK_ACTIVITIES } from '../mock-data/mock-db';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private activitiesSubject = new BehaviorSubject<ActivityEvent[]>([...MOCK_ACTIVITIES]);
  readonly activities$: Observable<ActivityEvent[]> = this.activitiesSubject.asObservable();

  getActivities(): Observable<ActivityEvent[]> {
    return this.activities$;
  }

  getActivitiesByTarget(targetId: string): Observable<ActivityEvent[]> {
    return this.activities$.pipe(
      map(list => list.filter(a => a.targetId === targetId))
    );
  }

  logActivity(data: Omit<ActivityEvent, 'id' | 'timestamp'>): void {
    const event: ActivityEvent = {
      ...data,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.activitiesSubject.next([event, ...this.activitiesSubject.value]);
  }
}
