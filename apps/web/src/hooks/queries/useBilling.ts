/**
 * TanStack Query Hooks - Billing
 * Enterprise-level data fetching for billing operations
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { billing, users } from '@/lib/api';
import { queryKeys, STALE_TIMES } from '@/lib/queryClient';

// ============================================
// BILLING QUERIES
// ============================================

/**
 * Fetch user's transactions
 * Used by: BillingPage
 */
export function useTransactions(userId: string | undefined) {
    return useQuery({
        queryKey: queryKeys.billing.transactions(userId || ''),
        queryFn: () => billing.listTransactions(userId!),
        staleTime: STALE_TIMES.default,
        enabled: !!userId,
    });
}

// ============================================
// BILLING MUTATIONS
// ============================================

/**
 * Create payment invoice
 */
export function useCreateInvoice() {
    return useMutation({
        mutationFn: (data: { userId: string; tier: string; amount: number; email: string }) =>
            billing.createInvoice(data),
    });
}

// ============================================
// USER QUERIES
// ============================================

/**
 * Fetch user profile by email
 * Used by: ProfilePage, Auth flows
 */
export function useUserProfile(email: string | undefined) {
    return useQuery({
        queryKey: queryKeys.user.profile(email || ''),
        queryFn: () => users.getMe(email!),
        staleTime: STALE_TIMES.default,
        enabled: !!email,
    });
}

/**
 * Update user profile
 */
export function useUpdateProfile() {
    return useMutation({
        mutationFn: (data: {
            id: string;
            name?: string;
            phone?: string;
            gender?: string;
            birthDate?: string;
            bank1Name?: string;
            bank1Number?: string;
            bank1Holder?: string;
            bank2Name?: string;
            bank2Number?: string;
            bank2Holder?: string;
            emoneyType?: string;
            emoneyNumber?: string;
            giftAddress?: string;
        }) => users.updateProfile(data),
    });
}
