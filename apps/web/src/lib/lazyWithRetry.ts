import { lazy, ComponentType } from 'react';

export const lazyWithRetry = <T extends ComponentType<any>>(
    componentImport: () => Promise<{ default: T }>
) =>
    lazy(async () => {
        const pageHasAlreadyBeenForceRefreshed = JSON.parse(
            window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
        );

        try {
            return await componentImport();
        } catch (error) {
            if (!pageHasAlreadyBeenForceRefreshed) {
                // Assuming that the user is not on the latest version of the application.
                // Let's refresh the page immediately.
                window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
                window.location.reload();
            }
            throw error;
        }
    });
