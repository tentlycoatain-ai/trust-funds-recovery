import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../../core/services/document.service';
import { CrmDocument, DocumentCategory } from '../../../core/models/document.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'crm-admin-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Document Repository & Filings</h2>
          <p class="subtitle">Secure storage for power of attorney filings, court release petitions, and verified client IDs.</p>
        </div>
        <button class="btn-upload" (click)="isUploadModalOpen.set(true)">+ Upload File</button>
      </div>

      <!-- Categories Filter Tabs -->
      <div class="filter-tabs">
        <button [class.active]="activeCategory() === 'all'" (click)="activeCategory.set('all')">All Documents</button>
        <button [class.active]="activeCategory() === 'contract'" (click)="activeCategory.set('contract')">Contracts & Retainers</button>
        <button [class.active]="activeCategory() === 'claim_filing'" (click)="activeCategory.set('claim_filing')">Claim Petitions</button>
        <button [class.active]="activeCategory() === 'court_order'" (click)="activeCategory.set('court_order')">Court Orders</button>
        <button [class.active]="activeCategory() === 'id_verification'" (click)="activeCategory.set('id_verification')">ID Verifications</button>
      </div>

      <!-- Document List Grid -->
      <div class="docs-grid">
        @for (doc of filteredDocs(); track doc.id) {
          <div class="doc-card">
            <div class="doc-top">
              <div class="icon-box">
                <img class="real-icon real-icon-inline" src="/assets/icons/coin-stack.png" alt="" aria-hidden="true" />
              </div>
              <crm-status-badge [status]="doc.status" />
            </div>

            <div class="doc-content">
              <h4>{{ doc.title }}</h4>
              <span class="file-name">{{ doc.fileName }}</span>
              <span class="file-size">{{ doc.fileSize }} • {{ doc.fileType | uppercase }}</span>
            </div>

            <div class="doc-footer">
              <div class="meta-owner">
                <span class="claimant">{{ doc.relatedCustomerName || 'Claim Document' }}</span>
                <span class="date">{{ doc.uploadDate | date:'mediumDate' }}</span>
              </div>
              <button class="btn-download" (click)="downloadDoc(doc)" title="Download file">
                ⬇
              </button>
            </div>
          </div>
        } @empty {
          <div class="empty">No documents in this category.</div>
        }
      </div>

      <!-- Upload Modal -->
      @if (isUploadModalOpen()) {
        <div class="modal-overlay" (click)="isUploadModalOpen.set(false)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Upload Document</h3>
              <button class="close-btn" (click)="isUploadModalOpen.set(false)"><img class="real-icon real-icon-inline" src="/assets/icons/close-seal.png" alt="" aria-hidden="true" /></button>
            </div>
            <form (ngSubmit)="submitUpload()" class="modal-form">
              <div class="form-group">
                <label>Document Title</label>
                <input type="text" [(ngModel)]="newDoc.title" name="title" required placeholder="e.g. Executed Limited Power of Attorney" class="input-ctrl" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Category</label>
                  <select [(ngModel)]="newDoc.category" name="category" class="input-ctrl">
                    <option value="contract">Contract</option>
                    <option value="claim_filing">Claim Filing</option>
                    <option value="court_order">Court Order</option>
                    <option value="id_verification">ID Verification</option>
                    <option value="power_of_attorney">Power of Attorney</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Customer Name</label>
                  <input type="text" [(ngModel)]="newDoc.customerName" name="customerName" required class="input-ctrl" />
                </div>
              </div>
              <div class="drop-zone">
                <img class="real-icon real-icon-inline" src="/assets/icons/coin-stack.png" alt="" aria-hidden="true" />
                <span>Drag & drop file or click to browse</span>
                <span class="file-hint">PDF, DOCX, PNG up to 25MB</span>
              </div>
              <div class="form-actions">
                <button type="button" class="btn-cancel" (click)="isUploadModalOpen.set(false)">Cancel</button>
                <button type="submit" class="btn-save">Upload Document</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; h2 { font-size: 1.65rem; color: #0F172A; margin: 0 0 0.25rem 0; } .subtitle { color: #64748B; font-size: 0.925rem; margin: 0; } }
    .btn-upload { background: #2563EB; color: #FFF; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; }
    .filter-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; button { padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; color: #64748B; background: #FFF; border: 1px solid #E2E8F0; cursor: pointer; &.active { background: #EFF6FF; color: #2563EB; border-color: #BFDBFE; } } }
    .docs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; }
    .doc-card { background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .doc-top { display: flex; align-items: center; justify-content: space-between; }
    .icon-box { width: 42px; height: 42px; border-radius: 8px; background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center; }
    .doc-content h4 { margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #0F172A; }
    .file-name { display: block; font-size: 0.75rem; color: #64748B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .file-size { font-size: 0.7rem; color: #94A3B8; font-weight: 600; }
    .doc-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #F1F5F9; padding-top: 0.75rem; }
    .meta-owner { display: flex; flex-direction: column; .claimant { font-size: 0.8125rem; font-weight: 600; color: #0F172A; } .date { font-size: 0.7rem; color: #94A3B8; } }
    .btn-download { width: 32px; height: 32px; border-radius: 6px; border: 1px solid #CBD5E1; background: #FFF; cursor: pointer; display: flex; align-items: center; justify-content: center; &:hover { background: #F1F5F9; } }
    .empty { grid-column: 1 / -1; text-align: center; padding: 3rem; color: #94A3B8; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 1050; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .modal-card { background: #FFF; border-radius: 16px; width: 100%; max-width: 520px; overflow: hidden; }
    .modal-header { padding: 1.25rem 1.5rem; background: #0F172A; color: #FFF; display: flex; justify-content: space-between; align-items: center; h3 { margin: 0; color: #FFF; } .close-btn { background: none; border: none; color: #94A3B8; font-size: 1.25rem; cursor: pointer; } }
    .modal-form { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; label { font-size: 0.8125rem; font-weight: 600; color: #475569; } }
    .input-ctrl { padding: 0.65rem 0.85rem; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 0.875rem; }
    .drop-zone { border: 2px dashed #CBD5E1; border-radius: 10px; padding: 1.5rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: #64748B; .file-hint { font-size: 0.75rem; color: #94A3B8; } }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }
    .btn-cancel { padding: 0.65rem 1.25rem; border: 1px solid #CBD5E1; background: #FFF; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-save { padding: 0.65rem 1.25rem; background: #2563EB; color: #FFF; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
  `]
})
export class AdminDocumentsComponent {
  private docService = inject(DocumentService);
  private toastService = inject(ToastService);

  activeCategory = signal<string>('all');
  allDocs = signal<CrmDocument[]>([]);
  isUploadModalOpen = signal<boolean>(false);

  newDoc = {
    title: '',
    category: 'claim_filing' as DocumentCategory,
    customerName: ''
  };

  constructor() {
    this.docService.documents$.subscribe(list => {
      this.allDocs.set(list);
    });
  }

  readonly filteredDocs = computed(() => {
    const cat = this.activeCategory();
    if (cat === 'all') return this.allDocs();
    return this.allDocs().filter(d => d.category === cat);
  });

  downloadDoc(doc: CrmDocument): void {
    this.toastService.info(`Downloading ${doc.fileName}...`);
  }

  submitUpload(): void {
    this.docService.uploadDocument({
      title: this.newDoc.title,
      fileName: `${this.newDoc.title.replace(/\s+/g, '_')}.pdf`,
      fileSize: '1.8 MB',
      fileType: 'pdf',
      category: this.newDoc.category,
      status: 'verified',
      relatedCustomerName: this.newDoc.customerName,
      uploadedBy: 'Eleanor Vance (Admin)'
    }).subscribe(d => {
      this.toastService.success(`Document ${d.title} uploaded!`);
      this.isUploadModalOpen.set(false);
    });
  }
}
