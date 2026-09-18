// ─── Document Model ─────────────────────────────────────────────────────────
export type DocumentCategory =
  | 'contract'
  | 'claim_filing'
  | 'id_verification'
  | 'court_order'
  | 'power_of_attorney'
  | 'bank_statement'
  | 'correspondence';

export type DocumentStatus = 'verified' | 'pending_review' | 'rejected' | 'draft';
export type DocumentFileType = 'pdf' | 'docx' | 'image' | 'sheet' | 'other';

export interface CrmDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;           // e.g. "2.4 MB"
  fileType: DocumentFileType;
  category: DocumentCategory;
  status: DocumentStatus;
  relatedCustomerId?: string;
  relatedCustomerName?: string;
  relatedCaseId?: string;
  relatedCaseNumber?: string;
  uploadedBy: string;
  uploadDate: string;         // ISO string
  url?: string;
  notes?: string;
}
