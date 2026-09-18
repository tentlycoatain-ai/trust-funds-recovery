import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';


export interface TimelineStep {
  number: string;
  title: string;
  shortDesc: string;
  detail?: string;
  badge?: string;
  actionItems?: string[];
}

@Component({
  selector: 'app-process-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './process-timeline.component.html',
  styleUrls: ['./process-timeline.component.scss']
})
export class ProcessTimelineComponent {
  @Input() steps: TimelineStep[] = [];
  @Input() showDetails = false;
  @Input() layout: 'grid' | 'timeline' = 'grid';
}
