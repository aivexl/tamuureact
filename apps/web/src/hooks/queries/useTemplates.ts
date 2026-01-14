/**
 * TanStack Query Hooks - Templates
 * Enterprise-level data fetching for template operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templates, categories, wishlist, type Category } from '@/lib/api';
import { queryKeys, STALE_TIMES } from '@/lib/queryClient';

// ============================================
// TEMPLATE QUERIES
// ============================================

/**
 * Fetch all templates with optimized caching
 * Used by: InvitationsStorePage, TemplateGallery
 */
export function useTemplates() {
    return useQuery({
        queryKey: queryKeys.templates.list(),
        queryFn: () => templates.list(),
        staleTime: STALE_TIMES.templates,
    });
}

/**
 * Fetch single template by ID or slug
 * Used by: PreviewPage, EditorPage
 */
export function useTemplate(idOrSlug: string | undefined) {
    return useQuery({
        queryKey: queryKeys.templates.detail(idOrSlug || ''),
        queryFn: () => templates.get(idOrSlug!),
        staleTime: STALE_TIMES.templates,
        enabled: !!idOrSlug,
    });
}

// ============================================
// TEMPLATE MUTATIONS
// ============================================

/**
 * Create new template
 */
export function useCreateTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => templates.create(data),
        onSuccess: () => {
            // Invalidate templates list to refetch
            queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
        },
    });
}

/**
 * Update existing template
 */
export function useUpdateTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => templates.update(id, data),
        onSuccess: (_, variables) => {
            // Invalidate both the list and the specific template
            queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.templates.detail(variables.id) });
        },
    });
}

/**
 * Delete template
 */
export function useDeleteTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => templates.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
        },
    });
}

// ============================================
// CATEGORY QUERIES
// ============================================

/**
 * Fetch all categories
 * Used by: InvitationsStorePage (filters)
 */
export function useCategories() {
    return useQuery({
        queryKey: queryKeys.categories.list(),
        queryFn: () => categories.list(),
        staleTime: STALE_TIMES.templates, // Categories rarely change
    });
}

/**
 * Create category
 */
export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { name: string; icon?: string; color?: string }) => categories.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        },
    });
}

/**
 * Update category
 */
export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) => categories.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        },
    });
}

/**
 * Delete category
 */
export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => categories.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        },
    });
}

// ============================================
// WISHLIST QUERIES
// ============================================

/**
 * Fetch user's wishlist
 */
export function useWishlist(userId: string | undefined) {
    return useQuery({
        queryKey: queryKeys.wishlist.user(userId || ''),
        queryFn: () => wishlist.list(userId!),
        staleTime: STALE_TIMES.default,
        enabled: !!userId,
    });
}

/**
 * Toggle wishlist item (add/remove)
 */
export function useToggleWishlist() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, templateId, isWishlisted }: { userId: string; templateId: string; isWishlisted: boolean }) =>
            wishlist.toggle(userId, templateId, isWishlisted),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.user(variables.userId) });
        },
    });
}
