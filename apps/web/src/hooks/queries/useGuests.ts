/**
 * TanStack Query Hooks - Guests & RSVP
 * Enterprise-level data fetching for guest management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guests, rsvp } from '@/lib/api';
import { queryKeys, STALE_TIMES } from '@/lib/queryClient';

// ============================================
// GUEST QUERIES
// ============================================

/**
 * Fetch guests for an invitation
 * Used by: GuestManagementPage
 */
export function useGuests(invitationId: string | undefined) {
    return useQuery({
        queryKey: queryKeys.guests.list(invitationId || ''),
        queryFn: () => guests.list(invitationId!),
        staleTime: STALE_TIMES.guests,
        enabled: !!invitationId,
    });
}

// ============================================
// GUEST MUTATIONS
// ============================================

/**
 * Create new guest
 */
export function useCreateGuest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            invitation_id: string;
            name: string;
            phone?: string;
            address?: string;
            table_number?: string;
            tier?: string;
            guest_count?: number;
            check_in_code?: string;
        }) => guests.create(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.guests.list(variables.invitation_id) });
        },
    });
}

/**
 * Update guest
 */
export function useUpdateGuest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, invitationId, data }: { id: string; invitationId: string; data: any }) =>
            guests.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.guests.list(variables.invitationId) });
        },
    });
}

/**
 * Delete guest
 */
export function useDeleteGuest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, invitationId }: { id: string; invitationId: string }) => guests.delete(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.guests.list(variables.invitationId) });
        },
    });
}

/**
 * Check-in guest
 */
export function useCheckInGuest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ idOrCode, invitationId }: { idOrCode: string; invitationId: string }) =>
            guests.checkIn(idOrCode),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.guests.list(variables.invitationId) });
        },
    });
}

/**
 * Check-out guest
 */
export function useCheckOutGuest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ idOrCode, invitationId }: { idOrCode: string; invitationId: string }) =>
            guests.checkOut(idOrCode),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.guests.list(variables.invitationId) });
        },
    });
}

// ============================================
// RSVP QUERIES
// ============================================

/**
 * Fetch RSVPs for an invitation
 * Used by: GuestManagementPage
 */
export function useRSVPs(invitationId: string | undefined) {
    return useQuery({
        queryKey: queryKeys.rsvp.list(invitationId || ''),
        queryFn: () => rsvp.list(invitationId!),
        staleTime: STALE_TIMES.guests,
        enabled: !!invitationId,
    });
}

/**
 * Fetch all wishes/RSVPs
 */
export function useAllRSVPs() {
    return useQuery({
        queryKey: queryKeys.rsvp.all,
        queryFn: () => rsvp.listAll(),
        staleTime: STALE_TIMES.guests,
    });
}

// ============================================
// RSVP MUTATIONS
// ============================================

/**
 * Submit RSVP (public form)
 */
export function useSubmitRSVP() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ invitationId, data }: {
            invitationId: string;
            data: {
                name: string;
                email?: string;
                phone?: string;
                attendance: 'attending' | 'not_attending' | 'maybe';
                guest_count?: number;
                message?: string;
            };
        }) => rsvp.submit(invitationId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.rsvp.list(variables.invitationId) });
        },
    });
}

/**
 * Update RSVP status
 */
export function useUpdateRSVP() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, invitationId, updates }: {
            id: string;
            invitationId: string;
            updates: { is_visible?: boolean; attendance?: string; message?: string };
        }) => rsvp.updateStatus(id, updates),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.rsvp.list(variables.invitationId) });
        },
    });
}

/**
 * Delete RSVP
 */
export function useDeleteRSVP() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, invitationId }: { id: string; invitationId: string }) => rsvp.delete(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.rsvp.list(variables.invitationId) });
        },
    });
}
