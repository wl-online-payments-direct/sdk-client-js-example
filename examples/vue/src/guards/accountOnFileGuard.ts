import type { NavigationGuard } from 'vue-router';
import StorageService from '@shared/services/StorageService';

export const requiresAccountOnFile: NavigationGuard = () => {
    const accountOnFileId = StorageService.getAccountOnFileId();

    if (!accountOnFileId) {
        return { name: 'payment', replace: true };
    }

    return true;
};
