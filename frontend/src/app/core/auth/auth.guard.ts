import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserRole } from '../models/models';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }
  return true;
};

export const roleGuard = (...allowedRoles: UserRole[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }
  if (!allowedRoles.includes(auth.role() as UserRole)) {
    router.navigate(['/']);
    return false;
  }
  return true;
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    const role = auth.role();
    router.navigate([
      role === 'admin' ? '/admin/owner-requests' : role === 'manager' ? '/manager/properties' : '/tenant/favorites'
    ]);
    return false;
  }
  return true;
};
