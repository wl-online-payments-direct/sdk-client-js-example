import type { NavigationGuard } from 'vue-router';
import StorageService from '@shared/services/StorageService';

export const requiresSession: NavigationGuard = () => {
    const session = StorageService.getSession();

    if (!session) {
        return { name: 'session', replace: true };
    }

    return true;
};
