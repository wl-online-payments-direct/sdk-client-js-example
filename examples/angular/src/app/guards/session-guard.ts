import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import StorageService from '@shared/services/StorageService';

export const sessionGuard: CanActivateFn = () => {
  const router = inject(Router);

  const session = StorageService.getSession();
  if (!session) {
    return router.createUrlTree(['/']);
  }

  return true;
};
