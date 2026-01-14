/**
 * TanStack Query Client Configuration
 * Enterprise-level configuration for server state management
 * 
 * @description Centralized QueryClient with optimized defaults for:
 * - Caching: 5-minute stale time, 30-minute cache time
 * - Retry: 3 attempts with exponential backoff
 * - Error handling: Global error boundary integration
 * - Performance: Request deduplication, background refetch
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Default stale times for different data types
 * Stale time = how long data is considered fresh
 */
export const STALE_TIMES = {
    /** Templates rarely change - cache for 10 minutes */
    templates: 10 * 60 * 1000,
    /** Invitations may update more frequently */
    invitations: 5 * 60 * 1000,
    /** Guest lists need fresher data */
    guests: 2 * 60 * 1000,
    /** Music library is static */
    music: 30 * 60 * 1000,
    /** Admin stats need real-time data */
    admin: 1 * 60 * 1000,
    /** Default stale time */
    default: 5 * 60 * 1000,
} as const;

/**
 * Query keys factory for type-safe, consistent query keys
 * Prevents key collisions and enables targeted invalidation
 */
export const queryKeys = {
    // Templates
    templates: {
        all: ['templates'] as const,
        list: () => [...queryKeys.templates.all, 'list'] as const,
        detail: (id: string) => [...queryKeys.templates.all, 'detail', id] as const,
        byCategory: (category: string) => [...queryKeys.templates.all, 'category', category] as const,
    },
    // Categories
    categories: {
        all: ['categories'] as const,
        list: () => [...queryKeys.categories.all, 'list'] as const,
    },
    // Invitations
    invitations: {
        all: ['invitations'] as const,
        list: (userId?: string) => [...queryKeys.invitations.all, 'list', userId] as const,
        detail: (id: string) => [...queryKeys.invitations.all, 'detail', id] as const,
    },
    // Guests & RSVP
    guests: {
        all: ['guests'] as const,
        list: (invitationId: string) => [...queryKeys.guests.all, 'list', invitationId] as const,
    },
    rsvp: {
        all: ['rsvp'] as const,
        list: (invitationId: string) => [...queryKeys.rsvp.all, 'list', invitationId] as const,
    },
    // Music
    music: {
        all: ['music'] as const,
        library: () => [...queryKeys.music.all, 'library'] as const,
    },
    // Billing
    billing: {
        all: ['billing'] as const,
        transactions: (userId: string) => [...queryKeys.billing.all, 'transactions', userId] as const,
    },
    // User data
    user: {
        all: ['user'] as const,
        profile: (userId: string) => [...queryKeys.user.all, 'profile', userId] as const,
        tier: (userId: string) => [...queryKeys.user.all, 'tier', userId] as const,
    },
    // Admin
    admin: {
        all: ['admin'] as const,
        stats: () => [...queryKeys.admin.all, 'stats'] as const,
        templates: () => [...queryKeys.admin.all, 'templates'] as const,
        music: () => [...queryKeys.admin.all, 'music'] as const,
    },
    // Display designs
    displayDesigns: {
        all: ['displayDesigns'] as const,
        list: (userId?: string) => [...queryKeys.displayDesigns.all, 'list', userId] as const,
        detail: (id: string) => [...queryKeys.displayDesigns.all, 'detail', id] as const,
    },
    // Wishlist
    wishlist: {
        all: ['wishlist'] as const,
        user: (userId: string) => [...queryKeys.wishlist.all, 'user', userId] as const,
    },
} as const;

/**
 * Create QueryClient with enterprise configuration
 */
export function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Data freshness
                staleTime: STALE_TIMES.default,
                gcTime: 30 * 60 * 1000, // 30 minutes garbage collection

                // Retry configuration with exponential backoff
                retry: 3,
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

                // Refetch behavior
                refetchOnWindowFocus: true,
                refetchOnReconnect: true,
                refetchOnMount: true,

                // Network mode
                networkMode: 'online',
            },
            mutations: {
                // Retry mutations once on failure
                retry: 1,
                retryDelay: 1000,

                // Network mode
                networkMode: 'online',
            },
        },
    });
}

/**
 * Singleton QueryClient instance
 * Use this in the app instead of creating new instances
 */
export const queryClient = createQueryClient();
