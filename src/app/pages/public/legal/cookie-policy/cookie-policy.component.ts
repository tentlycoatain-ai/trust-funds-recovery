import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'app-cookie-policy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-policy.component.html',
  styleUrls: ['./cookie-policy.component.scss']
})
export class CookiePolicyComponent implements OnInit {
  private readonly seo = inject(SeoService);

  analyticsEnabled = signal<boolean>(true);
  preferencesEnabled = signal<boolean>(true);
  preferencesSaved = signal<boolean>(false);

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'Cookie Policy & Consent Management',
      description: 'Review our Cookie Policy explaining session tokens, security cookies, privacy-preserving telemetry, and your consent controls.',
      keywords: 'cookie policy, consent management, website cookies, security tokens'
    });
  }

  toggleAnalytics(): void {
    this.analyticsEnabled.update(v => !v);
    this.preferencesSaved.set(false);
  }

  togglePreferences(): void {
    this.preferencesEnabled.update(v => !v);
    this.preferencesSaved.set(false);
  }

  savePreferences(): void {
    this.preferencesSaved.set(true);
    setTimeout(() => {
      this.preferencesSaved.set(false);
    }, 3500);
  }
}
