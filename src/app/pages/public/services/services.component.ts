import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { CtaBannerComponent } from '../../../shared/components/cta-banner/cta-banner.component';

export interface DetailedService {
  id: string;
  badge: string;
  title: string;
  shortDesc: string;
  detailedExplanation: string;
  processPoints: string[];
  deliverables: string[];
  inquiryCode: string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink, CtaBannerComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  private readonly seo = inject(SeoService);

  readonly services: DetailedService[] = [
    {
      id: 'investment-recovery',
      badge: 'Brokerage & Capital',
      title: 'Investment Dispute & Capital Recovery Support',
      shortDesc: 'Comprehensive assistance for individuals whose investment funds have been withheld by unregulated entities or deceptive trading houses.',
      detailedExplanation: 'Deceptive investment platforms frequently operate under the guise of licensed brokers before restricting withdrawals, fabricating fictitious tax requirements, or disappearing entirely. We systematically trace corporate entities, audit contract clauses, and organize regulatory complaints directed at clearing institutions and licensing registries.',
      processPoints: [
        'Contractual and promotional material examination',
        'Verification against international regulatory warning registers',
        'Formal demand letter and statutory non-compliance drafting',
        'Coordination with financial ombudsmen and cross-border regulatory bodies'
      ],
      deliverables: [
        'Comprehensive Brokerage Misconduct Dossier',
        'Formal Regulatory Complaint Filings',
        'Evidentiary Audit for Legal Representation'
      ],
      inquiryCode: 'investment-recovery'
    },
    {
      id: 'unauthorized-transactions',
      badge: 'Banking & Payments',
      title: 'Unauthorized Transaction & Wire Dispute Assistance',
      shortDesc: 'Investigation and formal presentation for unauthorized bank transfers, SWIFT routing errors, and merchant dispute escalations.',
      detailedExplanation: 'When accounts are accessed without authorization or wires are routed under deceptive pretenses, standard customer service channels frequently issue automated rejections. We prepare structured dispute packets that adhere strictly to international payment network rules, banking regulations, and commercial chargeback timelines.',
      processPoints: [
        'SWIFT MT103 and wire transmission audit',
        'Cardholder dispute and chargeback condition verification',
        'Bank supervisory ombudsman filing preparation',
        'Intermediary bank correspondence and tracing requests'
      ],
      deliverables: [
        'Institutional Banking Dispute Package',
        'Chargeback Code Compliance Audit',
        'Supervisory Escalation Brief'
      ],
      inquiryCode: 'unauthorized-transfers'
    },
    {
      id: 'online-fraud',
      badge: 'Cyber Investigation',
      title: 'Financial Fraud & Impersonation Investigation',
      shortDesc: 'Systematic forensic reconstruction of deceptive online schemes, fictitious escrow services, and impersonation-driven fund diversions.',
      detailedExplanation: 'Modern fraudulent operations utilize sophisticated multi-layered infrastructure to obfuscate fund destinations. Our cyber investigation team uncovers server hosting footprints, domain registration histories, and payment processor accounts to identify the true operational entities behind deceptive fronts.',
      processPoints: [
        'Digital infrastructure and domain ownership footprinting',
        'Counterparty communication and credential analysis',
        'Identification of payment collection gateways and accounts',
        'Preparation of formal law enforcement evidence submissions'
      ],
      deliverables: [
        'Digital Forensic Investigation Report',
        'Target Entity Infrastructure Map',
        'Law Enforcement Ready Incident Dossier'
      ],
      inquiryCode: 'online-fraud'
    },
    {
      id: 'asset-tracing',
      badge: 'Ledger Forensics',
      title: 'Digital Asset Tracing & Ledger Forensics',
      shortDesc: 'Tracing complex multi-hop transactions across public distributed ledgers to locate depository exchange endpoints.',
      detailedExplanation: 'While distributed ledgers provide transparency, navigating peel chains, mixers, and unhosted intermediary addresses requires advanced telemetry tools. We track funds from origin to destination, identifying depository clusters linked to regulated exchanges with know-your-customer (KYC) records.',
      processPoints: [
        'High-resolution multi-hop transaction tracing',
        'Exchange deposit and wallet clustering algorithms',
        'Preparation of time-sensitive account freeze requests',
        'Collaboration documentation for court-ordered subpoenas'
      ],
      deliverables: [
        'Visual On-Chain Transaction Flowchart',
        'Exchange Deposit Attribution Report',
        'Subpoena & KYC Discovery Summary'
      ],
      inquiryCode: 'crypto-asset-tracing'
    },
    {
      id: 'documentation-dossiers',
      badge: 'Case Assembly',
      title: 'Forensic Case Investigation & Evidence Dossiers',
      shortDesc: 'Transforming disorganized digital receipts, emails, and transaction notes into institutional-grade evidentiary dossiers.',
      detailedExplanation: 'The single most common reason valid claims fail is disorganized evidence. Financial institutions and courts require strict chronological consistency, authenticated headers, and clear loss accounting. We reconstruct your entire experience into an authoritative, indexed binder ready for institutional review.',
      processPoints: [
        'Authentication of email headers and digital correspondence',
        'Chronological accounting and loss reconciliation',
        'Exhibits indexing, referencing, and legal formatting',
        'Preparation of executive summaries for swift institutional consumption'
      ],
      deliverables: [
        'Master Evidence Index & Chronology',
        'Loss Reconciliation & Currency Audit',
        'Institutional Presentation Package'
      ],
      inquiryCode: 'case-documentation'
    },
    {
      id: 'recovery-consultation',
      badge: 'Advisory',
      title: 'Independent Case Feasibility Consultation',
      shortDesc: 'An objective, confidential review to examine whether a dispute possesses legal and evidentiary viability before committing resources.',
      detailedExplanation: 'Before investing significant time or legal fees, you need an honest, independent assessment of your recovery likelihood. We review your facts with clear-eyed objectivity, identifying statute of limitations constraints, jurisdictional hurdles, and the true solvency of counterparties.',
      processPoints: [
        'Rapid initial document and communication audit',
        'Jurisdictional and statutory limitation evaluation',
        'Counterparty viability and asset location assessment',
        'Written strategic guidance on recommended next steps'
      ],
      deliverables: [
        'Feasibility & Viability Scorecard',
        'Strategic Action Roadmap',
        'Risk & Cost-Benefit Analysis'
      ],
      inquiryCode: 'recovery-consultation'
    }
  ];

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'Forensic Financial Recovery Services',
      description: 'Explore Trust Funds Recovery specialized services: Investment Dispute Support, Unauthorized Wire Assistance, Asset Tracing, and Evidence Dossiers.',
      keywords: 'financial recovery services, wire dispute, investment fraud assessment, asset tracing, case evidence dossiers'
    });
  }
}
