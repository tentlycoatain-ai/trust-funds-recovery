import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'Privacy Policy | Data Protection & Confidentiality',
      description: 'Review the Trust Funds Recovery Privacy Policy detailing our client confidentiality commitments, encryption protocols, data retention, and user privacy rights.',
      keywords: 'privacy policy, data confidentiality, financial dispute data handling'
    });
  }
}
