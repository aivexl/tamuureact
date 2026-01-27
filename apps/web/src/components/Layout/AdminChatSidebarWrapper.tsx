/**
 * AdminChatSidebarWrapper.tsx
 * Enterprise-grade wrapper for backward compatibility
 * Ensures seamless transition between original and enhanced versions
 */

import React from 'react';
import { AdminChatSidebar } from './AdminChatSidebar';
import { AdminChatSidebarEnhanced } from './AdminChatSidebar-enhanced';

interface AdminChatSidebarWrapperProps {
    /**
     * Feature flag untuk mengaktifkan enhanced version
     * Default: false (gunakan original untuk backward compatibility)
     */
    useEnhanced?: boolean;
    
    /**
     * User ID untuk enhanced features
     * Optional: enhanced version akan handle jika tidak disediakan
     */
    userId?: string;
    
    /**
     * Additional props untuk enhanced version
     */
    enhancedProps?: {
        enableSessionTracking?: boolean;
        enableQuickActions?: boolean;
        enableSettingsPanel?: boolean;
        aiPersonality?: 'professional' | 'strategic' | 'analytical';
    };
}

/**
 * Enterprise wrapper yang memastikan 100% backward compatibility
 * sambil memungkinkan gradual rollout dari enhanced features
 */
export const AdminChatSidebarWrapper: React.FC<AdminChatSidebarWrapperProps> = ({
    useEnhanced = false,
    userId,
    enhancedProps = {}
}) => {
    // Log untuk monitoring dan audit
    if (process.env.NODE_ENV === 'development') {
        console.log(`[AdminChatSidebarWrapper] Rendering ${useEnhanced ? 'enhanced' : 'original'} version`, {
            userId,
            enhancedProps,
            timestamp: new Date().toISOString()
        });
    }

    // Gunakan enhanced version jika di-enable
    if (useEnhanced) {
        return (
            <AdminChatSidebarEnhanced 
                userId={userId}
                {...enhancedProps}
            />
        );
    }

    // Default: gunakan original version untuk backward compatibility
    return <AdminChatSidebar />;
};

/**
 * Migration helper untuk gradual rollout
 * Enterprise-grade feature flag system
 */
export const shouldUseEnhancedVersion = (userContext?: {
    userId?: string;
    role?: string;
    permissions?: string[];
    tier?: string;
}): boolean => {
    // Strategy 1: Environment-based rollout
    if (process.env.NEXT_PUBLIC_FORCE_ENHANCED_CHAT === 'true') {
        return true;
    }

    // Strategy 2: User-based rollout (percentage-based)
    if (userContext?.userId) {
        // Hash user ID untuk consistent assignment
        const hash = userContext.userId.split('').reduce((acc, char) => {
            return acc + char.charCodeAt(0);
        }, 0);
        
        // Rollout 20% user untuk enhanced version
        const rolloutPercentage = 20;
        return (hash % 100) < rolloutPercentage;
    }

    // Strategy 3: Role-based rollout
    if (userContext?.role === 'admin' && userContext?.tier === 'premium') {
        return true;
    }

    // Default: use original version
    return false;
};

/**
 * Enterprise monitoring untuk track adoption
 */
export const trackChatVersionUsage = (version: 'original' | 'enhanced', userContext?: any) => {
    // Analytics tracking (implementasi sesuai dengan analytics platform)
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'chat_version_usage', {
            version,
            user_id: userContext?.userId,
            timestamp: new Date().toISOString()
        });
    }

    // Custom analytics endpoint
    if (typeof window !== 'undefined') {
        // Send to custom analytics service
        fetch('/api/analytics/chat-version', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                version,
                userContext,
                timestamp: new Date().toISOString()
            })
        }).catch(console.error); // Silent fail untuk tidak mengganggu user experience
    }
};

export default AdminChatSidebarWrapper;