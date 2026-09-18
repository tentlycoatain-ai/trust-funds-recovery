import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  template: `
    @if (visible()) {
      <aside class="cookie-card" role="dialog" aria-labelledby="cookie-title" aria-describedby="cookie-copy">
        <div class="cookie-brand"><img src="/assets/brand/tfr-mark.svg" alt="Trust Funds Recovery" /></div>
        <div class="cookie-copy">
          <p class="cookie-eyebrow">Privacy, by design</p>
          <h2 id="cookie-title">A quieter, safer experience</h2>
          <p id="cookie-copy">We use essential cookies to keep this site secure and remember your preferences. Optional analytics cookies help us improve the experience.</p>
          <div class="cookie-actions">
            <button class="cookie-primary" type="button" (click)="acceptAll()">Accept all</button>
            <button class="cookie-secondary" type="button" (click)="acceptEssential()">Essential only</button>
          </div>
        </div>
        <button class="cookie-dismiss" type="button" aria-label="Dismiss cookie notice" (click)="acceptEssential()">×</button>
      </aside>
    }
  `,
  styles: [`
    :host { position: fixed; inset: auto 1.25rem 1.25rem auto; z-index: 2200; width: min(450px, calc(100vw - 2.5rem)); }
    .cookie-card { position: relative; display: grid; grid-template-columns: 42px 1fr; gap: 1rem; padding: 1.15rem; color: #FFF; background: rgba(17, 26, 46, .96); border: 1px solid rgba(255,255,255,.13); border-radius: 20px; box-shadow: 0 22px 58px rgba(10,16,32,.28); backdrop-filter: blur(18px); animation: cookie-in 320ms cubic-bezier(.16,1,.3,1); }
    .cookie-brand { width: 42px; height: 42px; display: grid; place-items: center; background: #FFF; border-radius: 13px; }
    .cookie-brand img { width: 30px; height: 30px; }
    .cookie-eyebrow { margin: .1rem 0 .35rem; color: #E1BF79; font-size: .65rem; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
    h2 { margin: 0 2rem .4rem 0; color: #FFF; font: 700 1rem/1.2 var(--font-heading, Inter, sans-serif); letter-spacing: -.02em; }
    .cookie-copy > p:last-of-type { margin: 0; color: #B8C3D5; font-size: .76rem; line-height: 1.55; }
    .cookie-actions { display: flex; flex-wrap: wrap; gap: .55rem; margin-top: .85rem; }
    button { font: inherit; cursor: pointer; }
    .cookie-primary, .cookie-secondary { min-height: 32px; padding: .45rem .75rem; border-radius: 999px; font-size: .72rem; font-weight: 750; }
    .cookie-primary { color: #111A2E; background: #E1BF79; border: 1px solid #E1BF79; }
    .cookie-secondary { color: #EAF0FA; background: transparent; border: 1px solid rgba(255,255,255,.24); }
    .cookie-dismiss { position: absolute; top: .55rem; right: .65rem; width: 24px; height: 24px; padding: 0; color: #AAB6C9; background: transparent; border: 0; font-size: 1.2rem; line-height: 1; }
    @keyframes cookie-in { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 560px) { :host { inset: auto .75rem .75rem; width: auto; } .cookie-card { grid-template-columns: 1fr; } .cookie-brand { display: none; } }
  `]
})
export class CookieConsentComponent {
  readonly visible = signal<boolean>(this.getInitialVisibility());

  acceptAll(): void { this.save('all'); }
  acceptEssential(): void { this.save('essential'); }

  private save(value: 'all' | 'essential'): void {
    if (typeof localStorage !== 'undefined') localStorage.setItem('tfr-cookie-consent', value);
    this.visible.set(false);
  }

  private getInitialVisibility(): boolean {
    return typeof localStorage === 'undefined' || !localStorage.getItem('tfr-cookie-consent');
  }
}
