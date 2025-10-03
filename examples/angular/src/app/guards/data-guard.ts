import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import StorageService from '@shared/services/StorageService';

export const dataGuard: CanActivateFn = () => {
  const router = inject(Router);

  const encryptedData = StorageService.getEncryptedData();
  const cardSpecificData = StorageService.getCardPaymentSpecificData();

  if (cardSpecificData || encryptedData) {
    return true;
  }

  return router.createUrlTree(['/payment']);
};
