import type { NavigationGuard } from 'vue-router';
import StorageService from '@shared/services/StorageService';

export const requiresProduct: NavigationGuard = () => {
    const product = StorageService.getPaymentProduct();

    if (!product) {
        return { name: 'payment', replace: true };
    }

    return true;
};
