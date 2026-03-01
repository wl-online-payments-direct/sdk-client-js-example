import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import StorageService from '@shared/services/StorageService';

export const contextGuard: CanActivateFn = () => {
  const router = inject(Router);

  const context = StorageService.getPaymentContext();

  if (!context) {
    return router.createUrlTree(['/payment']);
  }

  return true;
};
