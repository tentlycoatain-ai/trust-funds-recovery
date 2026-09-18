import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { VideoModalComponent } from '../../../shared/components/video-modal/video-modal.component';
import { FaqAccordionComponent, FaqItem } from '../../../shared/components/faq-accordion/faq-accordion.component';
import { ProcessTimelineComponent, TimelineStep } from '../../../shared/components/process-timeline/process-timeline.component';
import { ServiceCardComponent, ServiceItem } from '../../../shared/components/service-card/service-card.component';
import { TestimonialCardComponent, TestimonialItem } from '../../../shared/components/testimonial-card/testimonial-card.component';
import { CtaBannerComponent } from '../../../shared/components/cta-banner/cta-banner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    VideoModalComponent,
    FaqAccordionComponent,
    ProcessTimelineComponent,
    ServiceCardComponent,
    TestimonialCardComponent,
    CtaBannerComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private readonly seo = inject(SeoService);

  heroVideoFailed = signal<boolean>(false);
  isVideoModalOpen = signal<boolean>(false);
  modalVideoTitle = signal<string>('How Trust Funds Recovery Manages Complex Cases');
  modalVideoSubtitle = signal<string>('An in-depth look at our forensic assessment, document assembly, and structured dispute protocols.');

  // 4-Step Homepage Process
  readonly homepageSteps: TimelineStep[] = [
    {
      number: '01',
      title: 'Submit Your Case',
      shortDesc: 'Provide details regarding your transaction history, correspondence, and financial platforms involved through our encrypted intake portal.',
      badge: 'Step 1: Intake'
    },
    {
      number: '02',
      title: 'Case Assessment',
      shortDesc: 'Our specialists review the documentation, analyze transaction trails, and evaluate potential avenues for institutional outreach.',
      badge: 'Step 2: Analysis'
    },
    {
      number: '03',
      title: 'Recovery Strategy',
      shortDesc: 'We construct a customized action plan detailing evidence dossiers, formal dispute notices, and regulatory reporting steps.',
      badge: 'Step 3: Execution'
    },
    {
      number: '04',
      title: 'Ongoing Support',
      shortDesc: 'Receive dedicated case updates and continuous assistance as communications with financial entities and mediators progress.',
      badge: 'Step 4: Advocacy'
    }
  ];

  // Core Service Categories
  readonly serviceList: ServiceItem[] = [
    {
      id: 'investment-recovery',
      iconType: 'investment',
      title: 'Investment Dispute Support',
      shortDesc: 'Assistance for individuals facing withheld capital, misleading brokerages, or unfulfilled contractual returns.',
      scopePoints: [
        'Brokerage documentation audits',
        'Regulatory reporting dossiers',
        'Formal dispute representation packets'
      ],
      recommendedFor: 'Capital Disputes'
    },
    {
      id: 'online-fraud',
      iconType: 'fraud',
      title: 'Financial Fraud Assessment',
      shortDesc: 'Systematic analysis of deceptive schemes, fake trading portals, and impersonation-driven fund transfers.',
      scopePoints: [
        'Digital footprint reconstruction',
        'Entity verification & domain audits',
        'Forensic chronology reporting'
      ],
      recommendedFor: 'Deceptive Schemes'
    },
    {
      id: 'unauthorized-transfers',
      iconType: 'transaction',
      title: 'Unauthorized Transaction Aid',
      shortDesc: 'Support with bank chargebacks, disputed wire transfers, and compromised payment gateway transactions.',
      scopePoints: [
        'Banking dispute compliance filings',
        'Merchant chargeback packaging',
        'Payment processor escalations'
      ],
      recommendedFor: 'Banking Disputes'
    },
    {
      id: 'crypto-asset-tracing',
      iconType: 'asset',
      title: 'Asset Tracing Support',
      shortDesc: 'Ledger tracking, visual transaction mapping, and wallet cluster analysis for digital asset routing.',
      scopePoints: [
        'On-chain flow diagramming',
        'Exchange deposit cluster tagging',
        'Law enforcement evidence bundles'
      ],
      recommendedFor: 'Digital Assets'
    },
    {
      id: 'scam-recovery',
      iconType: 'scam',
      title: 'Deceptive Platform Recovery',
      shortDesc: 'Support when trading platforms freeze accounts, fabricate withdrawal tax requirements, or cease response.',
      scopePoints: [
        'Withdrawal condition audits',
        'Platform legitimacy research',
        'Cross-jurisdiction notification'
      ],
      recommendedFor: 'Platform Freezes'
    },
    {
      id: 'case-documentation',
      iconType: 'dossier',
      title: 'Documentation & Dossiers',
      shortDesc: 'Transforming chaotic emails, chat logs, and bank slips into an airtight legal & institutional evidence dossier.',
      scopePoints: [
        'Chronological timeline alignment',
        'Exhibits indexation & labeling',
        'Ready-for-attorney formatting'
      ],
      recommendedFor: 'Evidence Assembly'
    }
  ];

  // Homepage FAQ
  readonly faqList: FaqItem[] = [
    {
      question: 'What types of recovery cases do you handle?',
      answer: 'We assist with a broad scope of financial disputes, including unauthorized banking transfers, unregulated brokerage disputes, online investment deception, withheld account funds, and complex digital asset tracing. Every case undergoes an initial review to confirm its viability before engagement.'
    },
    {
      question: 'How does the recovery assessment process begin?',
      answer: 'The process begins when you complete our secure intake questionnaire. You provide an overview of the event, dates, amounts, and correspondence. A case intake officer reviews your submission and determines whether we possess the specialized capabilities to support your specific circumstance.'
    },
    {
      question: 'What information do I need to provide?',
      answer: 'Helpful documentation includes wire confirmations, account statements, receipts, platform contracts, correspondence (emails, chat transcripts), and transaction identifiers (hashes or SWIFT MT103 confirmations).'
    },
    {
      question: 'How long does a case assessment take?',
      answer: 'Initial qualification reviews typically take 24 to 48 business hours. If we determine that a viable recovery strategy exists, we outline realistic timelines, expected procedural stages, and required evidence.'
    },
    {
      question: 'Is financial recovery 100% guaranteed?',
      answer: 'No legitimate organization can guarantee recovery outcomes. Any company promising a 100% recovery guarantee is not operating transparently. Outcomes depend on fund routing, jurisdictional boundaries, institutional cooperation, and evidentiary strength. Our obligation is to apply maximum forensic rigor and institutional leverage.'
    },
    {
      question: 'How is my private information handled and secured?',
      answer: 'All client information, identification, and financial documentation are held under strict non-disclosure terms, stored in encrypted repositories, and accessed strictly on a need-to-know basis by assigned case officers.'
    },
    {
      question: 'What happens after I submit my case?',
      answer: 'You will receive an automated case tracking reference number. An intake coordinator will review your materials and contact you via your preferred communication method to discuss potential next steps.'
    }
  ];

  // Testimonials (clearly marked scenario placeholders)
  readonly testimonialList: TestimonialItem[] = [
    {
      id: 't-1',
      category: 'Unauthorized Wire Transfer',
      scenarioTitle: 'Clarity and Structure During a High-Stress Banking Dispute',
      quote: 'When our commercial account was compromised through unauthorized wire instructions, we were met with bureaucratic silence from our intermediary bank. Trust Funds Recovery assembled a comprehensive forensic dossier that forced an escalated supervisory review.',
      clientInitials: 'M. S.',
      location: 'London, UK',
      isVerifiedPlaceholder: true
    },
    {
      id: 't-2',
      category: 'Unregulated Brokerage Dispute',
      scenarioTitle: 'Legitimate Guidance Without False or Unrealistic Promises',
      quote: 'What set this team apart was their total honesty. They clearly explained what was feasible and what was not, rather than promising instant miracles. Their structured documentation was pivotal in communicating with regulatory bodies.',
      clientInitials: 'R. K.',
      location: 'Toronto, Canada',
      isVerifiedPlaceholder: true
    },
    {
      id: 't-3',
      category: 'Digital Asset Tracing',
      scenarioTitle: 'On-Chain Forensics Provided Indisputable Transaction Trails',
      quote: 'The wallet tracing diagrams and deposit cluster reports produced by Trust Funds Recovery allowed our legal team to subpoena the relevant exchange accounts. Highly methodical and professional work.',
      clientInitials: 'D. H.',
      location: 'Zurich, Switzerland',
      isVerifiedPlaceholder: true
    }
  ];

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'Helping You Navigate Financial Recovery',
      description: 'Trust Funds Recovery provides transparent, structured forensic assessment and assistance for complex financial disputes, unauthorized transfers, and asset tracing.',
      keywords: 'financial recovery, fund tracing, unauthorized transaction assistance, investment disputes, forensic case assessment'
    });
  }

  onHeroVideoError(): void {
    this.heroVideoFailed.set(true);
  }

  openVideoModal(title?: string, subtitle?: string): void {
    if (title) this.modalVideoTitle.set(title);
    if (subtitle) this.modalVideoSubtitle.set(subtitle);
    this.isVideoModalOpen.set(true);
  }

  closeVideoModal(): void {
    this.isVideoModalOpen.set(false);
  }
}
