import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

@Component({
  selector: 'app-faq-accordion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-accordion.component.html',
  styleUrls: ['./faq-accordion.component.scss']
})
export class FaqAccordionComponent {
  @Input() items: FaqItem[] = [];
  @Input() allowMultiple = false;

  openIndices = signal<number[]>([0]);

  isOpen(index: number): boolean {
    return this.openIndices().includes(index);
  }

  toggle(index: number): void {
    if (this.isOpen(index)) {
      this.openIndices.update(indices => indices.filter(i => i !== index));
    } else {
      if (this.allowMultiple) {
        this.openIndices.update(indices => [...indices, index]);
      } else {
        this.openIndices.set([index]);
      }
    }
  }
}
