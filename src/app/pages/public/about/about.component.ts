import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { CtaBannerComponent } from '../../../shared/components/cta-banner/cta-banner.component';

export interface TeamRoleProfile {
  title: string;
  department: string;
  scope: string;
  qualifications: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, CtaBannerComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  private readonly seo = inject(SeoService);

  readonly teamRoles: TeamRoleProfile[] = [
    {
      title: 'Senior Forensic Dispute Officer',
      department: 'Case Investigation Unit',
      scope: 'Specializes in transaction trail reconstruction, counterparty identification, and banking compliance inquiries.',
      qualifications: 'Financial dispute analysis & banking regulatory protocol oversight'
    },
    {
      title: 'Digital Ledger & Asset Analyst',
      department: 'Cyber Forensics Unit',
      scope: 'Conducts cluster analytics, transaction path diagramming, and exchange depository wallet mapping.',
      qualifications: 'Distributed ledger forensics & blockchain telemetry audit standards'
    },
    {
      title: 'Institutional Liaison & Documentation Lead',
      department: 'Regulatory Coordination',
      scope: 'Formats evidence packages according to formal banking standards and coordinates with international mediation bodies.',
      qualifications: 'Cross-border evidence packaging & formal administrative dispute resolution'
    },
    {
      title: 'Client Intake & Advocacy Coordinator',
      department: 'Client Support Services',
      scope: 'Guides clients through evidence gathering, explains case feasibility honestly, and provides continuous status transparency.',
      qualifications: 'Empathetic case intake, client confidentiality & procedural advocacy'
    }
  ];

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'About Our Organization & Principles',
      description: 'Learn about Trust Funds Recovery — our mission, structured forensic approach, core values, and dedicated team of case specialists.',
      keywords: 'about trust funds recovery, financial recovery team, dispute specialists, forensic fund tracing'
    });
  }
}
