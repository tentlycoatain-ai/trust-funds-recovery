import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  if (user && user.role === 'admin') {
    return true;
  }

  // If user is logged in as agent, redirect to agent dashboard
  if (user && user.role === 'agent') {
    return router.parseUrl('/agent/dashboard');
  }

  return router.parseUrl('/admin/login');
};
