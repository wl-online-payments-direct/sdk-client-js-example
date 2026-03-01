import type { NavigationGuard } from 'vue-router';
import StorageService from '@shared/services/StorageService';

export const requiresContext: NavigationGuard = () => {
    const context = StorageService.getPaymentContext();

    if (!context) {
        return { name: 'payment', replace: true };
    }

    return true;
};
