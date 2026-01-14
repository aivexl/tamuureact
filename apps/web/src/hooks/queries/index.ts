/**
 * TanStack Query Hooks - Barrel Export
 * Centralized export for all query hooks
 */

// Templates & Categories
export {
    useTemplates,
    useTemplate,
    useCreateTemplate,
    useUpdateTemplate,
    useDeleteTemplate,
    useCategories,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
    useWishlist,
    useToggleWishlist,
} from './useTemplates';

// Invitations & Display Designs
export {
    useInvitations,
    useInvitation,
    useCreateInvitation,
    useUpdateInvitation,
    useDeleteInvitation,
    useDisplayDesigns,
    useDisplayDesign,
    useCreateDisplayDesign,
    useUpdateDisplayDesign,
    useDeleteDisplayDesign,
    usePreviewData,
} from './useInvitations';
export type { Invitation, DisplayDesign } from './useInvitations';

// Guests & RSVP
export {
    useGuests,
    useCreateGuest,
    useUpdateGuest,
    useDeleteGuest,
    useCheckInGuest,
    useCheckOutGuest,
    useRSVPs,
    useAllRSVPs,
    useSubmitRSVP,
    useUpdateRSVP,
    useDeleteRSVP,
} from './useGuests';

// Music
export { useMusicLibrary } from './useMusic';
export type { Song } from './useMusic';

// Billing & User
export {
    useTransactions,
    useCreateInvoice,
    useUserProfile,
    useUpdateProfile,
} from './useBilling';

// Admin
export {
    useAdminStats,
    useAdminTemplates,
} from './useAdmin';

// Re-export query keys and stale times for advanced usage
export { queryKeys, STALE_TIMES } from '@/lib/queryClient';
