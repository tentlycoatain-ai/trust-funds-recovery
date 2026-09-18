import { Component, Input } from '@angular/core';

export type VisualIconName =
  | 'investment'
  | 'fraud'
  | 'scam'
  | 'transaction'
  | 'asset'
  | 'dossier'
  | 'dashboard'
  | 'customer'
  | 'lead'
  | 'case'
  | 'task'
  | 'call'
  | 'agent'
  | 'payment'
  | 'document'
  | 'report'
  | 'audit'
  | 'settings'
  | 'notification'
  | 'website'
  | 'logout'
  | 'switch';

@Component({
  selector: 'app-visual-icon',
  standalone: true,
  template: `<img class="visual-icon" [src]="assetPath" [alt]="label" [attr.aria-hidden]="label ? null : true" />`,
  styles: [`
    :host { display: inline-flex; width: 1.45rem; height: 1.45rem; align-items: center; justify-content: center; flex: 0 0 auto; }
    .visual-icon { display: block; width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 2px 3px rgba(0,0,0,.16)); }
  `]
})
export class VisualIconComponent {
  @Input() icon: VisualIconName | string = 'document';
  @Input() label = '';

  private readonly assets: Record<string, string> = {
    investment: '/assets/icons/dollar-note.png',
    fraud: '/assets/icons/warning-file.png',
    scam: '/assets/icons/warning-file.png',
    transaction: '/assets/icons/payment-card.png',
    asset: '/assets/icons/coin-stack.png',
    dossier: '/assets/icons/document-folder.png',
    dashboard: '/assets/icons/document-folder.png',
    customer: '/assets/icons/document-folder.png',
    lead: '/assets/icons/dollar-note.png',
    case: '/assets/icons/warning-file.png',
    task: '/assets/icons/document-folder.png',
    call: '/assets/icons/payment-card.png',
    agent: '/assets/icons/document-folder.png',
    payment: '/assets/icons/coin-stack.png',
    document: '/assets/icons/document-folder.png',
    report: '/assets/icons/coin-stack.png',
    audit: '/assets/icons/warning-file.png',
    settings: '/assets/icons/payment-card.png',
    notification: '/assets/icons/warning-file.png',
    website: '/assets/icons/document-folder.png',
    logout: '/assets/icons/payment-card.png',
    switch: '/assets/icons/document-folder.png'
  };

  get assetPath(): string {
    return this.assets[this.icon] || this.assets['document'];
  }
}
