import { useEffect } from 'react';

interface ExternalRedirectProps {
    to: string;
}

/**
 * Component to handle instant redirection to external URLs.
 * React Router's Navigate only works for internal routes.
 * Uses location.replace() to prevent back button from returning to this redirect page.
 * Returns null for instant, invisible redirect - no loading UI.
 */
export const ExternalRedirect: React.FC<ExternalRedirectProps> = ({ to }) => {
    useEffect(() => {
        // Use replace() instead of href to prevent back button issues
        // This replaces the current history entry instead of adding a new one
        window.location.replace(to);
    }, [to]);

    // Return null for instant redirect - no visible loading state
    return null;
};
