import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'app-disclaimer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './disclaimer.component.html',
  styleUrls: ['./disclaimer.component.scss']
})
export class DisclaimerComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'Legal & Financial Disclaimer',
      description: 'Review the Trust Funds Recovery non-guarantee declaration, non-legal counsel disclaimer, and general information advisory.',
      keywords: 'legal disclaimer, financial recovery disclaimer, no outcome guarantee notice'
    });
  }
}
