import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const agentGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  // Allow both agent AND admin (admins can inspect agent views or switch role)
  if (user && (user.role === 'agent' || user.role === 'admin')) {
    return true;
  }

  return router.parseUrl('/agent/login');
};
