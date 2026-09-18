import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { ProcessTimelineComponent, TimelineStep } from '../../../shared/components/process-timeline/process-timeline.component';
import { CtaBannerComponent } from '../../../shared/components/cta-banner/cta-banner.component';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, ProcessTimelineComponent, CtaBannerComponent],
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss']
})
export class HowItWorksComponent implements OnInit {
  private readonly seo = inject(SeoService);

  readonly detailedSteps: TimelineStep[] = [
    {
      number: '01',
      title: 'Tell Us What Happened',
      shortDesc: 'Initiate your review through our secure confidential intake form with an overview of your loss event.',
      detail: 'Provide a chronological summary of how the financial dispute began, names of platforms or counterparties involved, dates, and total loss exposure. We review all entries under strict NDA.',
      badge: 'Initial Contact',
      actionItems: [
        'Complete encrypted intake questionnaire',
        'Identify counterparties and communication channels',
        'Specify dates and amounts under dispute'
      ]
    },
    {
      number: '02',
      title: 'Submit Relevant Documentation',
      shortDesc: 'Gather transaction confirmations, contracts, communications, and banking statements for forensic audit.',
      detail: 'Clear documentation is the bedrock of recovery. We guide you on securing authentic SWIFT wire receipts, digital transaction hashes, signed agreements, and preserved email or chat logs.',
      badge: 'Evidence Gathering',
      actionItems: [
        'Upload bank slips (MT103 / wire receipts)',
        'Export unedited chat transcripts and email threads',
        'Provide platform terms or contractual agreements'
      ]
    },
    {
      number: '03',
      title: 'Comprehensive Case Assessment',
      shortDesc: 'Our forensic analysts evaluate jurisdiction, counterparty solvency, and evidentiary viability.',
      detail: 'Within 24 to 48 hours, our casework team runs entity registry checks, scans regulatory warning lists, and evaluates statute of limitations constraints to provide an honest viability evaluation.',
      badge: 'Forensic Audit',
      actionItems: [
        'Counterparty corporate entity verification',
        'Jurisdictional conflict & regulatory check',
        'Issuance of formal Case Feasibility Scorecard'
      ]
    },
    {
      number: '04',
      title: 'Strategic Recovery Planning',
      shortDesc: 'We develop a tailored dispute blueprint specifying institutional avenues and evidence packaging.',
      detail: 'Depending on the dispute nature, the plan may entail formal banking chargeback filings, digital ledger attribution reports for subpoenas, or ombudsman escalations across financial jurisdictions.',
      badge: 'Action Roadmap',
      actionItems: [
        'Selection of primary institutional channels',
        'Drafting of formal statutory dispute notices',
        'Assembly of authenticated evidence binders'
      ]
    },
    {
      number: '05',
      title: 'Case Execution & Ongoing Updates',
      shortDesc: 'Continuous advocacy, tracking of institutional deadlines, and transparent progress reports.',
      detail: 'You are assigned a dedicated case coordinator who interfaces with institutions, responds to evidentiary inquiries, and provides status briefings without requiring you to navigate bureaucratic hurdles alone.',
      badge: 'Institutional Outreach',
      actionItems: [
        'Formal dossier delivery to intermediary institutions',
        'Deadline monitoring and procedural responses',
        'Weekly or milestone-based status updates'
      ]
    },
    {
      number: '06',
      title: 'Resolution Review & Future Safeguards',
      shortDesc: 'Reviewing settlement offers, restitution routing, and establishing long-term account security safeguards.',
      detail: 'Upon reaching resolution or formal institutional determinations, our team reviews settlement conditions and provides a comprehensive financial safety debrief to prevent future exposure.',
      badge: 'Conclusion',
      actionItems: [
        'Restitution terms verification and accounting',
        'Secure settlement account guidance',
        'Post-case security debrief and account hardening'
      ]
    }
  ];

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'How the Recovery Process Works',
      description: 'Understand the 6-step financial recovery journey at Trust Funds Recovery: intake, evidence gathering, forensic audit, strategic planning, advocacy, and resolution.',
      keywords: 'how financial recovery works, recovery process, dispute resolution steps, case assessment workflow'
    });
  }
}
