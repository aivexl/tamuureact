/**
 * TanStack Query Hooks - Invitations
 * Enterprise-level data fetching for invitation operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invitations, templates, userDisplayDesigns } from '@/lib/api';
import { queryKeys, STALE_TIMES } from '@/lib/queryClient';
// ============================================
// TYPES
// ============================================

export interface Invitation {
    id: string;
    name: string;
    slug?: string;
    thumbnail?: string;
    thumbnail_url?: string;
    category?: string;
    sections?: any[];
    layers?: any[];
    is_published?: boolean;
    status?: 'draft' | 'published';
    created_at?: string;
    updated_at?: string;
}

export interface DisplayDesign {
    id: string;
    user_id: string;
    name: string;
    thumbnail_url?: string;
    sections?: any[];
    orbit_layers?: any[];
    created_at?: string;
    updated_at?: string;
}

// ============================================
// INVITATION QUERIES
// ============================================

/**
 * Fetch user's invitations
 * Used by: DashboardPage, InvitationsTab
 */
export function useInvitations(userId?: string) {
    return useQuery({
        queryKey: queryKeys.invitations.list(userId),
        queryFn: () => invitations.list(userId),
        staleTime: STALE_TIMES.invitations,
    });
}

/**
 * Fetch single invitation by ID or slug
 * Used by: PreviewPage, EditorPage
 */
export function useInvitation(idOrSlug: string | undefined) {
    return useQuery({
        queryKey: queryKeys.invitations.detail(idOrSlug || ''),
        queryFn: () => invitations.get(idOrSlug!),
        staleTime: STALE_TIMES.invitations,
        enabled: !!idOrSlug,
    });
}

/**
 * Fetch data for PreviewPage (tries template, then invitation)
 */
export function usePreviewData(slug: string | undefined) {
    return useQuery({
        queryKey: ['preview', slug],
        queryFn: async () => {
            if (!slug) return null;
            const timestamp = Date.now();
            try {
                // UNICORN: Bypass edge cache for fresh preview data
                const data = await templates.get(`${slug}?t=${timestamp}`);
                return { data, source: 'templates' };
            } catch (e) {
                try {
                    const data = await invitations.get(`${slug}?t=${timestamp}`);
                    return { data, source: 'invitations' };
                } catch (e2) {
                    throw new Error('Data not found');
                }
            }
        },
        enabled: !!slug && slug !== 'draft',
        staleTime: STALE_TIMES.invitations,
    });
}

// ============================================
// INVITATION MUTATIONS
// ============================================

/**
 * Create new invitation
 */
export function useCreateInvitation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => invitations.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
        },
    });
}

/**
 * Update existing invitation
 */
export function useUpdateInvitation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => invitations.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.invitations.detail(variables.id) });
        },
    });
}

/**
 * Delete invitation
 */
export function useDeleteInvitation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => invitations.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
        },
    });
}

// ============================================
// DISPLAY DESIGNS QUERIES
// ============================================

/**
 * Fetch user's display designs
 * Used by: DashboardPage, WelcomeDisplaysTab
 */
export function useDisplayDesigns(userId?: string) {
    return useQuery({
        queryKey: queryKeys.displayDesigns.list(userId),
        queryFn: () => userDisplayDesigns.list(userId),
        staleTime: STALE_TIMES.invitations,
    });
}

/**
 * Fetch single display design
 */
export function useDisplayDesign(id: string | undefined) {
    return useQuery({
        queryKey: queryKeys.displayDesigns.detail(id || ''),
        queryFn: () => userDisplayDesigns.get(id!),
        staleTime: STALE_TIMES.invitations,
        enabled: !!id,
    });
}

// ============================================
// DISPLAY DESIGN MUTATIONS
// ============================================

/**
 * Create display design
 */
export function useCreateDisplayDesign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => userDisplayDesigns.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.displayDesigns.all });
        },
    });
}

/**
 * Update display design
 */
export function useUpdateDisplayDesign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => userDisplayDesigns.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.displayDesigns.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.displayDesigns.detail(variables.id) });
        },
    });
}

/**
 * Delete display design
 */
export function useDeleteDisplayDesign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => userDisplayDesigns.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.displayDesigns.all });
        },
    });
}
