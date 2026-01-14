/**
 * TanStack Query Hooks - Admin
 * Enterprise-level data fetching for admin operations
 */

import { useQuery } from '@tanstack/react-query';
import { admin, templates } from '@/lib/api';
import { queryKeys, STALE_TIMES } from '@/lib/queryClient';

// ============================================
// ADMIN QUERIES
// ============================================

/**
 * Fetch admin dashboard statistics
 * Used by: AdminDashboardPage
 */
export function useAdminStats() {
    return useQuery({
        queryKey: queryKeys.admin.stats(),
        queryFn: () => admin.getStats(),
        staleTime: STALE_TIMES.admin, // 1 minute - stats need to be fresh
    });
}

/**
 * Fetch all templates for admin management
 * Used by: AdminTemplatesPage
 */
export function useAdminTemplates() {
    return useQuery({
        queryKey: queryKeys.admin.templates(),
        queryFn: () => templates.list(),
        staleTime: STALE_TIMES.admin,
    });
}
