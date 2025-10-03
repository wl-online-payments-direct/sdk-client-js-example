import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import StorageService from '@shared/services/StorageService';

export const accountOnFileGuard: CanActivateFn = () => {
  const router = inject(Router);

  const accountOnFileId = StorageService.getAccountOnFileId();

  if (!accountOnFileId) {
    return router.createUrlTree(['/payment']);
  }

  return true;
};
