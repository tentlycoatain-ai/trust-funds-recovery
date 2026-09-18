import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CookieConsentComponent } from './shared/components/cookie-consent/cookie-consent.component';
import { ToastComponent } from './crm/shared/components/toast/toast.component';

@Component({
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CookieConsentComponent, ToastComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private router = inject(Router);

  readonly isCrmRoute = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.checkIsCrm())
    ),
    { initialValue: this.checkIsCrm() }
  );

  private checkIsCrm(): boolean {
    const path = typeof window !== 'undefined' ? window.location.pathname : this.router.url;
    return path.startsWith('/admin') || path.startsWith('/agent');
  }
}
