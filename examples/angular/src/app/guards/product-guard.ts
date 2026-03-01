import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import StorageService from '@shared/services/StorageService';

export const productGuard: CanActivateFn = () => {
  const router = inject(Router);

  const productId = StorageService.getPaymentProductId();

  if (!productId) {
    return router.createUrlTree(['/payment']);
  }

  return true;
};
