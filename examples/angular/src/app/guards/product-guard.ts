import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import StorageService from '@shared/services/StorageService';

export const productGuard: CanActivateFn = () => {
  const router = inject(Router);

  const product = StorageService.getPaymentProduct();
  if (!product) {
    return router.createUrlTree(['/payment']);
  }

  return true;
};
