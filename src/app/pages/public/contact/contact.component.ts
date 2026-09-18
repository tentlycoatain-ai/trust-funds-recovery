import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { CaseService, CaseSubmissionResult } from '../../../core/services/case.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  readonly caseService = inject(CaseService);

  contactForm!: FormGroup;
  submittedSuccessfully = signal<boolean>(false);
  submissionDetails = signal<CaseSubmissionResult | null>(null);

  readonly categoryOptions = [
    { value: 'investment-recovery', label: 'Investment Dispute / Withheld Brokerage Capital' },
    { value: 'unauthorized-transfers', label: 'Unauthorized Bank Wire or Payment Transfer' },
    { value: 'online-fraud', label: 'Financial Fraud / Deceptive Online Scheme' },
    { value: 'crypto-asset-tracing', label: 'Digital Asset / Blockchain Ledger Tracing' },
    { value: 'scam-recovery', label: 'Unregulated Trading Platform Dispute' },
    { value: 'case-documentation', label: 'Forensic Case Investigation & Evidence Dossier' },
    { value: 'other', label: 'Other Complex Financial Dispute' }
  ];

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'Contact Case Intake | Start Your Recovery',
      description: 'Submit your case details securely to Trust Funds Recovery. Confidential preliminary assessment with zero false guarantees.',
      keywords: 'contact trust funds recovery, submit case, financial dispute intake, case evaluation form'
    });

    const queryCategory = this.route.snapshot.queryParams['category'] || '';

    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]{7,20}$/)]],
      country: ['', [Validators.required]],
      recoveryCategory: [queryCategory || '', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(30)]],
      preferredContact: ['email', [Validators.required]],
      consent: [false, [Validators.requiredTrue]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.contactForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  async onSubmit(): Promise<void> {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const formValues = this.contactForm.value;
    const result = await this.caseService.submitCase(formValues);

    if (result.success) {
      this.submissionDetails.set(result);
      this.submittedSuccessfully.set(true);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  }

  resetForm(): void {
    this.contactForm.reset({
      preferredContact: 'email',
      consent: false,
      recoveryCategory: ''
    });
    this.caseService.resetStatus();
    this.submittedSuccessfully.set(false);
    this.submissionDetails.set(null);
  }
}
