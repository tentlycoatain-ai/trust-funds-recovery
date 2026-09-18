import { Injectable, signal } from '@angular/core';

export interface CaseSubmission {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  recoveryCategory: string;
  description: string;
  preferredContact: 'email' | 'phone' | 'whatsapp';
  consent: boolean;
}

export interface CaseSubmissionResult {
  success: boolean;
  referenceId?: string;
  submittedAt?: Date;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private isSubmittingState = signal<boolean>(false);
  private lastSubmissionResult = signal<CaseSubmissionResult | null>(null);

  readonly isSubmitting = this.isSubmittingState.asReadonly();
  readonly submissionResult = this.lastSubmissionResult.asReadonly();

  async submitCase(data: CaseSubmission): Promise<CaseSubmissionResult> {
    this.isSubmittingState.set(true);

    // Simulate professional secure intake transmission
    return new Promise((resolve) => {
      setTimeout(() => {
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const refId = `TFR-2026-${randomDigits}`;

        const result: CaseSubmissionResult = {
          success: true,
          referenceId: refId,
          submittedAt: new Date(),
          message: 'Your case intake has been securely received. An assessment specialist will review the details within 1–2 business days.'
        };

        this.lastSubmissionResult.set(result);
        this.isSubmittingState.set(false);
        resolve(result);
      }, 1200);
    });
  }

  resetStatus(): void {
    this.lastSubmissionResult.set(null);
    this.isSubmittingState.set(false);
  }
}
