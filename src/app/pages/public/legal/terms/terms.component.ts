import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'Terms & Conditions of Service',
      description: 'Review the Terms & Conditions governing website usage, casework intake, intellectual property, and limitations of liability at Trust Funds Recovery.',
      keywords: 'terms of service, legal terms, recovery conditions, website usage'
    });
  }
}
