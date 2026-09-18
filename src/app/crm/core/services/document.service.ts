import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CrmDocument } from '../models/document.model';
import { MOCK_DOCUMENTS } from '../mock-data/mock-db';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private docsSubject = new BehaviorSubject<CrmDocument[]>([...MOCK_DOCUMENTS]);
  readonly documents$: Observable<CrmDocument[]> = this.docsSubject.asObservable();

  getDocuments(): Observable<CrmDocument[]> {
    return this.documents$;
  }

  getDocumentById(id: string): Observable<CrmDocument | undefined> {
    return this.documents$.pipe(
      map(docs => docs.find(d => d.id === id))
    );
  }

  getDocumentsByCase(caseId: string): Observable<CrmDocument[]> {
    return this.documents$.pipe(
      map(docs => docs.filter(d => d.relatedCaseId === caseId))
    );
  }

  getDocumentsByCustomer(customerId: string): Observable<CrmDocument[]> {
    return this.documents$.pipe(
      map(docs => docs.filter(d => d.relatedCustomerId === customerId))
    );
  }

  uploadDocument(data: Omit<CrmDocument, 'id' | 'uploadDate'>): Observable<CrmDocument> {
    const newDoc: CrmDocument = {
      ...data,
      id: `doc-${Date.now()}`,
      uploadDate: new Date().toISOString()
    };

    const updated = [newDoc, ...this.docsSubject.value];
    this.docsSubject.next(updated);
    return of(newDoc);
  }

  updateDocument(id: string, changes: Partial<CrmDocument>): Observable<CrmDocument | undefined> {
    const list = [...this.docsSubject.value];
    const index = list.findIndex(d => d.id === id);
    if (index === -1) return of(undefined);

    const updated = { ...list[index], ...changes };
    list[index] = updated;
    this.docsSubject.next(list);
    return of(updated);
  }

  deleteDocument(id: string): Observable<boolean> {
    const list = this.docsSubject.value.filter(d => d.id !== id);
    this.docsSubject.next(list);
    return of(true);
  }
}
