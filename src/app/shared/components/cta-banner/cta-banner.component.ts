import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cta-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cta-banner.component.html',
  styleUrls: ['./cta-banner.component.scss']
})
export class CtaBannerComponent {
  @Input() badge = 'Take the First Step';
  @Input() title = 'Ready to Discuss Your Case?';
  @Input() description = 'Our team conducts initial case reviews to assess documentation, jurisdictional avenues, and potential recovery pathways with complete discretion.';
  @Input() primaryBtnText = 'Start Your Recovery';
  @Input() primaryBtnLink = '/contact';
  @Input() secondaryBtnText = 'How It Works';
  @Input() secondaryBtnLink = '/how-it-works';
}
