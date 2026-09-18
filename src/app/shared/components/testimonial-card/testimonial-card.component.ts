import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TestimonialItem {
  id: string;
  category: string;
  scenarioTitle: string;
  quote: string;
  clientInitials: string;
  location: string;
  isVerifiedPlaceholder: boolean;
}

@Component({
  selector: 'app-testimonial-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonial-card.component.html',
  styleUrls: ['./testimonial-card.component.scss']
})
export class TestimonialCardComponent {
  @Input() testimonial!: TestimonialItem;
}
