import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { FaqAccordionComponent, FaqItem } from '../../../shared/components/faq-accordion/faq-accordion.component';
import { CtaBannerComponent } from '../../../shared/components/cta-banner/cta-banner.component';

export interface ResourceArticle {
  id: string;
  category: string;
  categorySlug: 'fraud-awareness' | 'recovery-guide' | 'banking-rules' | 'asset-safety';
  title: string;
  excerpt: string;
  readTime: string;
  publishDate: string;
  keyTakeaways: string[];
}

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, RouterLink, FaqAccordionComponent, CtaBannerComponent],
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss']
})
export class ResourcesComponent implements OnInit {
  private readonly seo = inject(SeoService);

  activeCategory = signal<string>('all');

  readonly articles: ResourceArticle[] = [
    {
      id: 'anatomy-of-investment-scams',
      category: 'Fraud Awareness',
      categorySlug: 'fraud-awareness',
      title: 'The Anatomy of Boilerplate Online Investment Schemes',
      excerpt: 'How deceptive trading platforms manufacture artificial profits, fabricate withdrawal clearance fees, and isolate victims.',
      readTime: '6 min read',
      publishDate: 'September 2026',
      keyTakeaways: [
        'Recognize fictitious withdrawal tax demands',
        'Verify entity credentials against cross-border registries',
        'Preserve server logs before account dashboards are locked'
      ]
    },
    {
      id: 'step-by-step-swift-recall',
      category: 'Banking Compliance',
      categorySlug: 'banking-rules',
      title: 'Navigating SWIFT Wire Recalls and MT103 Intermediary Tracing',
      excerpt: 'An institutional breakdown of how interbank wire transfers route through correspondent institutions and the strict time windows for recall requests.',
      readTime: '8 min read',
      publishDate: 'August 2026',
      keyTakeaways: [
        'Understand SWIFT MT199 & MT202 messaging protocols',
        'Why automated phone reps give inaccurate wire status',
        'How to formalize an urgent interbank indemnification notice'
      ]
    },
    {
      id: 'ledger-clustering-explained',
      category: 'Digital Asset Safety',
      categorySlug: 'asset-safety',
      title: 'How Forensic Blockchain Tracing Uncovers Exchange Depository Wallets',
      excerpt: 'Demystifying peel chains, coin joins, and deposit cluster mapping. How on-chain data becomes admissible court evidence.',
      readTime: '7 min read',
      publishDate: 'August 2026',
      keyTakeaways: [
        'Transaction hashes are permanent, public records',
        'Regulated exchanges maintain KYC records for subpoena',
        'Why individual self-proclaimed "hackers" cannot recover crypto'
      ]
    },
    {
      id: 'evidence-dossier-handbook',
      category: 'Recovery Guide',
      categorySlug: 'recovery-guide',
      title: 'The Evidence Dossier Handbook: What Financial Regulators Actually Read',
      excerpt: 'Why 80% of informal consumer complaints are rejected within 48 hours and how to structure chronological exhibits that demand attention.',
      readTime: '5 min read',
      publishDate: 'July 2026',
      keyTakeaways: [
        'Build authenticated email header archives',
        'Format transaction ledgers to bank reconciliation standards',
        'Attach certified identification affidavits'
      ]
    },
    {
      id: 'chargeback-reversal-standards',
      category: 'Banking Compliance',
      categorySlug: 'banking-rules',
      title: 'Card Network Dispute Regulations: Compelling Evidence Under Visa/Mastercard Rules',
      excerpt: 'A comprehensive guide to cardholder dispute codes, merchant misrepresentation clauses, and strict arbitration filing deadlines.',
      readTime: '9 min read',
      publishDate: 'June 2026',
      keyTakeaways: [
        'Identify proper dispute reason codes (e.g. Condition 13.1)',
        'Merchant documentation rebuttal strategies',
        'Pre-arbitration and formal arbitration timelines'
      ]
    },
    {
      id: 'recovery-room-scams-warning',
      category: 'Fraud Awareness',
      categorySlug: 'fraud-awareness',
      title: 'Red Flags of Secondary Recovery Scams ("Recovery Rooms")',
      excerpt: 'Victims of financial loss are frequently targeted a second time by fraudulent operators posing as law enforcement or hackers. Here is how to verify legitimacy.',
      readTime: '4 min read',
      publishDate: 'May 2026',
      keyTakeaways: [
        'Legitimate companies never guarantee 100% recovery',
        'No private firm can hack into someone else\'s bank account',
        'Beware of unsolicited calls claiming your funds were found'
      ]
    }
  ];

  readonly generalFaqs: FaqItem[] = [
    {
      question: 'What is the very first step someone should take upon discovering a loss?',
      answer: 'Immediately contact your financial institution\'s fraud division (not general customer service) to request an urgent freeze or wire recall. Preserve all communications, download account statements, and do not confront the suspected counterparty prematurely, as they may delete online accounts and logs.'
    },
    {
      question: 'Why can\'t I just hire someone to "hack" into the scammer\'s account to get my money back?',
      answer: 'Any entity or individual claiming they can "hack into a wallet" or "force an unauthorized reversal" is perpetrating a secondary scam (often called a recovery room scheme). Fund recovery is strictly an institutional and legal process involving banking networks, regulated exchanges, compliance officers, and judicial subpoenas.'
    },
    {
      question: 'What is an MT103 and why is it so important?',
      answer: 'An MT103 is the standardized SWIFT message confirmation generated when an international wire transfer occurs. It acts as the definitive receipt showing the sending bank, correspondent banks, recipient bank, account number, timestamp, and field 70 remittance details.'
    },
    {
      question: 'How do financial ombudsmen differ from regular courts?',
      answer: 'Financial ombudsmen (such as the UK Financial Ombudsman Service or AFCA in Australia) are independent statutory dispute resolution bodies designed to impartially resolve disputes between consumers and financial institutions without the heavy cost of civil litigation.'
    }
  ];

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'Knowledge Center, Recovery Guides & Fraud Awareness',
      description: 'Educational resources, fraud awareness articles, banking compliance guides, and recovery FAQs provided by Trust Funds Recovery specialists.',
      keywords: 'financial recovery resources, fraud education, dispute guides, banking compliance, blockchain tracing insights'
    });
  }

  setCategory(category: string): void {
    this.activeCategory.set(category);
  }

  filteredArticles(): ResourceArticle[] {
    const cat = this.activeCategory();
    if (cat === 'all') {
      return this.articles;
    }
    return this.articles.filter(a => a.categorySlug === cat);
  }
}
