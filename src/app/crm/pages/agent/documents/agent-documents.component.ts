import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/auth/auth.service';
import { CrmDocument, DocumentCategory } from '../../../core/models/document.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'crm-agent-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Case Documents & Legal Filings</h1>
          <p class="page-subtitle">Repository of agreements, notarized powers of attorney, surplus petitions, and ID proofs</p>
        </div>
        <button class="btn-primary" (click)="showUploadModal = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload Document
        </button>
      </div>

      <!-- Categories & Search -->
      <div class="filter-bar">
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search by title, file name, case #..." class="search-input" />
        </div>

        <div class="cat-tabs">
          @for (cat of categories; track cat.id) {
            <button class="cat-btn" [class.active]="selectedCategory() === cat.id" (click)="selectedCategory.set(cat.id)">
              {{ cat.label }}
            </button>
          }
        </div>
      </div>

      <!-- Documents Grid -->
      <div class="docs-grid">
        @for (doc of filteredDocuments(); track doc.id) {
          <div class="doc-card">
            <div class="doc-top">
              <div class="file-icon" [class]="'type-' + doc.fileType">
                @switch (doc.fileType) {
                  @case ('pdf') {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  }
                  @case ('docx') {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  }
                  @default {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  }
                }
              </div>

              <div class="doc-badge" [class]="'status-' + doc.status">
                {{ doc.status.replace('_', ' ') | uppercase }}
              </div>
            </div>

            <h3 class="doc-title">{{ doc.title }}</h3>
            <span class="file-name">{{ doc.fileName }} ({{ doc.fileSize }})</span>

            <div class="doc-meta-box">
              @if (doc.relatedCaseNumber) {
                <div class="meta-row">
                  <span class="m-lbl">Case:</span>
                  <span class="m-val case-code">{{ doc.relatedCaseNumber }}</span>
                </div>
              }
              @if (doc.relatedCustomerName) {
                <div class="meta-row">
                  <span class="m-lbl">Claimant:</span>
                  <span class="m-val">{{ doc.relatedCustomerName }}</span>
                </div>
              }
              <div class="meta-row">
                <span class="m-lbl">Uploaded:</span>
                <span class="m-val text-muted">{{ formatUploadDate(doc.uploadDate) }}</span>
              </div>
            </div>

            <div class="doc-actions">
              <button class="action-btn" (click)="viewDoc(doc)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                Preview
              </button>
              <button class="action-btn" (click)="downloadDoc(doc)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download
              </button>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            </svg>
            <p>No documents found matching category or filter.</p>
          </div>
        }
      </div>

      <!-- Upload Modal -->
      @if (showUploadModal) {
        <div class="modal-backdrop">
          <div class="modal-card">
            <div class="modal-header">
              <h3>Upload Legal Document</h3>
              <button class="close-btn" (click)="showUploadModal = false">✕</button>
            </div>
            <div class="modal-body">
              <label class="input-lbl">Document Title</label>
              <input type="text" [(ngModel)]="newDocTitle" placeholder="e.g. Notarized Power of Attorney - Claim TRF-5012" class="modal-input" />

              <div class="form-row">
                <div class="form-col">
                  <label class="input-lbl">Category</label>
                  <select [(ngModel)]="newDocCategory" class="modal-select">
                    <option value="contract">Contract / Retainer</option>
                    <option value="claim_filing">County Claim Filing</option>
                    <option value="id_verification">ID Verification</option>
                    <option value="power_of_attorney">Power of Attorney</option>
                    <option value="court_order">Court Order</option>
                    <option value="bank_statement">Bank Document</option>
                  </select>
                </div>
                <div class="form-col">
                  <label class="input-lbl">Related Case # (Optional)</label>
                  <input type="text" [(ngModel)]="newDocCase" placeholder="TRF-5012" class="modal-input" />
                </div>
              </div>

              <div class="upload-dropzone" (click)="simulateFileSelect()">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span class="drop-text">{{ selectedFile ? selectedFile : 'Click to select PDF or image file' }}</span>
                <span class="drop-sub">Max size 25MB (Encrypted storage)</span>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" (click)="showUploadModal = false">Cancel</button>
              <button class="btn-primary" (click)="uploadDoc()" [disabled]="!newDocTitle.trim()">Confirm Upload</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 700; color: var(--crm-text-primary); margin: 0 0 4px; }
    .page-subtitle { font-size: 14px; color: var(--crm-text-secondary); margin: 0; }
    .btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: var(--crm-accent); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .filter-bar { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .search-box { display: flex; align-items: center; gap: 8px; background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 8px; padding: 8px 12px; }
    .search-input { border: none; background: transparent; outline: none; font-size: 13px; color: var(--crm-text-primary); width: 100%; }
    .cat-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
    .cat-btn { border: 1px solid var(--crm-border); background: var(--crm-surface); color: var(--crm-text-secondary); font-size: 12px; font-weight: 500; padding: 6px 14px; border-radius: 20px; cursor: pointer; transition: all 0.2s; }
    .cat-btn:hover { border-color: var(--crm-accent); color: var(--crm-accent); }
    .cat-btn.active { background: var(--crm-accent); color: white; border-color: var(--crm-accent); }
    .docs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; }
    .doc-card { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 10px; transition: transform 0.15s, box-shadow 0.15s; }
    .doc-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
    .doc-top { display: flex; justify-content: space-between; align-items: center; }
    .file-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .type-pdf { background: #fee2e2; color: #dc2626; }
    .type-docx { background: #eff6ff; color: #2563eb; }
    .type-image { background: #fdf2f8; color: #db2777; }
    .type-other { background: #f3f4f6; color: #4b5563; }
    .doc-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
    .status-verified { background: #dcfce7; color: #16a34a; }
    .status-pending_review { background: #fef3c7; color: #d97706; }
    .status-rejected { background: #fee2e2; color: #dc2626; }
    .status-draft { background: #f3f4f6; color: #6b7280; }
    .doc-title { font-size: 15px; font-weight: 600; color: var(--crm-text-primary); margin: 0; }
    .file-name { font-size: 12px; color: var(--crm-text-muted); }
    .doc-meta-box { background: var(--crm-surface-2); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; }
    .meta-row { display: flex; justify-content: space-between; font-size: 12px; }
    .m-lbl { color: var(--crm-text-muted); }
    .m-val { font-weight: 500; color: var(--crm-text-primary); }
    .case-code { font-family: monospace; color: var(--crm-accent); font-weight: 700; }
    .doc-actions { display: flex; gap: 8px; margin-top: 4px; padding-top: 10px; border-top: 1px solid var(--crm-border); }
    .action-btn { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 8px; padding: 7px 12px; font-size: 12px; font-weight: 500; color: var(--crm-text-secondary); cursor: pointer; transition: all 0.15s; }
    .action-btn:hover { background: var(--crm-surface-2); color: var(--crm-text-primary); border-color: var(--crm-accent); }
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--crm-text-muted); }
    .empty-state svg { opacity: 0.4; margin-bottom: 12px; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 20px; }
    .modal-card { background: var(--crm-surface); border: 1px solid var(--crm-border); border-radius: 16px; width: 100%; max-width: 500px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-bottom: 1px solid var(--crm-border); }
    .modal-header h3 { font-size: 16px; font-weight: 700; color: var(--crm-text-primary); margin: 0; }
    .close-btn { background: none; border: none; font-size: 16px; color: var(--crm-text-muted); cursor: pointer; }
    .modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
    .input-lbl { font-size: 12px; font-weight: 600; color: var(--crm-text-secondary); }
    .modal-input, .modal-select { border: 1px solid var(--crm-border); border-radius: 8px; background: var(--crm-surface-2); padding: 9px 12px; font-size: 13px; color: var(--crm-text-primary); outline: none; width: 100%; box-sizing: border-box; }
    .form-row { display: flex; gap: 12px; }
    .form-col { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .upload-dropzone { border: 2px dashed var(--crm-border); border-radius: 12px; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; background: var(--crm-surface-2); transition: border-color 0.2s; }
    .upload-dropzone:hover { border-color: var(--crm-accent); }
    .drop-text { font-size: 13px; font-weight: 600; color: var(--crm-text-primary); margin-top: 8px; }
    .drop-sub { font-size: 11px; color: var(--crm-text-muted); margin-top: 2px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--crm-border); background: var(--crm-surface-2); }
    .btn-cancel { background: none; border: 1px solid var(--crm-border); border-radius: 8px; padding: 8px 16px; font-size: 13px; color: var(--crm-text-secondary); cursor: pointer; }
  `]
})
export class AgentDocumentsComponent {
  private documentService = inject(DocumentService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  private allDocs = toSignal(this.documentService.documents$, { initialValue: [] });

  searchQuery = '';
  selectedCategory = signal<string>('all');

  showUploadModal = false;
  newDocTitle = '';
  newDocCategory: DocumentCategory = 'contract';
  newDocCase = '';
  selectedFile: string | null = null;

  categories = [
    { id: 'all', label: 'All Files' },
    { id: 'contract', label: 'Contracts' },
    { id: 'power_of_attorney', label: 'POA & Notarized' },
    { id: 'claim_filing', label: 'Court Filings' },
    { id: 'id_verification', label: 'ID Proofs' },
    { id: 'court_order', label: 'Court Orders' }
  ];

  filteredDocuments = computed(() => {
    const cat = this.selectedCategory();
    const query = this.searchQuery.toLowerCase().trim();

    return this.allDocs().filter(d => {
      const matchesCat = cat === 'all' || d.category === cat;
      const matchesQuery = !query ||
        d.title.toLowerCase().includes(query) ||
        d.fileName.toLowerCase().includes(query) ||
        (d.relatedCaseNumber && d.relatedCaseNumber.toLowerCase().includes(query)) ||
        (d.relatedCustomerName && d.relatedCustomerName.toLowerCase().includes(query));

      return matchesCat && matchesQuery;
    });
  });

  viewDoc(doc: CrmDocument) {
    this.toastService.show(`Opening secure preview: ${doc.fileName}`, 'info');
  }

  downloadDoc(doc: CrmDocument) {
    this.toastService.show(`Downloading ${doc.fileName}...`, 'success');
  }

  simulateFileSelect() {
    this.selectedFile = 'Claimant_Signed_Agreement_2026.pdf';
    this.toastService.show('File staged for upload: Claimant_Signed_Agreement_2026.pdf', 'info');
  }

  uploadDoc() {
    if (!this.newDocTitle.trim()) return;
    const current = this.authService.currentUser();
    this.documentService.uploadDocument({
      title: this.newDocTitle.trim(),
      fileName: this.selectedFile || `${this.newDocTitle.toLowerCase().replace(/\\s+/g, '_')}.pdf`,
      fileSize: '1.8 MB',
      fileType: 'pdf',
      category: this.newDocCategory,
      status: 'pending_review',
      relatedCaseNumber: this.newDocCase || 'TRF-5012',
      uploadedBy: current?.name || 'Marcus Vance',
      notes: 'Uploaded via agent workspace'
    }).subscribe(() => {
      this.toastService.show('Document uploaded and queued for verification', 'success');
      this.showUploadModal = false;
      this.newDocTitle = '';
      this.newDocCase = '';
      this.selectedFile = null;
    });
  }

  formatUploadDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
