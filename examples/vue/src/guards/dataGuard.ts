import type { NavigationGuard } from 'vue-router';
import StorageService from '@shared/services/StorageService';

export const requiresData: NavigationGuard = () => {
    const encryptedData = StorageService.getEncryptedData();
    const cardPaymentSpecificData = StorageService.getCardPaymentSpecificData();

    if (encryptedData || cardPaymentSpecificData) {
        return true;
    }

    return { name: 'payment', replace: true };
};
