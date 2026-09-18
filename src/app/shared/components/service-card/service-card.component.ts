import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VisualIconComponent } from '../visual-icon/visual-icon.component';

export interface ServiceItem {
  id: string;
  iconType: 'investment' | 'fraud' | 'scam' | 'transaction' | 'asset' | 'dossier' | 'consult';
  title: string;
  shortDesc: string;
  scopePoints: string[];
  recommendedFor: string;
}

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CommonModule, RouterLink, VisualIconComponent],
  templateUrl: './service-card.component.html',
  styleUrls: ['./service-card.component.scss']
})
export class ServiceCardComponent {
  @Input() service!: ServiceItem;
  @Input() showCta = true;
}
