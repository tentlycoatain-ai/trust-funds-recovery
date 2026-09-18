import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);

  private readonly defaultTitle = 'Trust Funds Recovery | Transparent & Professional Financial Recovery Support';
  private readonly defaultDesc = 'Trust Funds Recovery helps individuals and organizations navigate the path to financial recovery through structured case assessment, documentation, and dedicated guidance.';

  updateMetadata(config: SeoConfig): void {
    const fullTitle = config.title ? `${config.title} | Trust Funds Recovery` : this.defaultTitle;
    this.titleService.setTitle(fullTitle);

    const desc = config.description || this.defaultDesc;
    this.metaService.updateTag({ name: 'description', content: desc });
    this.metaService.updateTag({ property: 'og:title', content: config.ogTitle || fullTitle });
    this.metaService.updateTag({ property: 'og:description', content: config.ogDescription || desc });
    this.metaService.updateTag({ property: 'og:type', content: config.ogType || 'website' });

    if (config.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords });
    }
  }
}
