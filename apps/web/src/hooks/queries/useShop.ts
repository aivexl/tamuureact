import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shop, admin, shopCategories } from '../../lib/api';
import { useStore } from '../../store/useStore';
import { toast } from 'react-hot-toast';

export const useShopDirectory = (category?: string, query?: string) => {
    return useQuery({
        queryKey: ['shop_directory', category, query],
        queryFn: () => shop.getDirectory(category, query)
    });
};

export const useShopCategories = () => {
    return useQuery({
        queryKey: ['shop_categories_public'],
        queryFn: () => shopCategories.listPublic()
    });
};

export const useProductDiscovery = (options: { category?: string; query?: string; city?: string }) => {
    return useQuery({
        queryKey: ['shop_product_discovery', options.category, options.query, options.city],
        queryFn: () => shop.getDiscoverProducts(options)
    });
};

export const useSpecialProducts = () => {
    return useQuery({
        queryKey: ['shop_products_special'],
        queryFn: () => shop.getSpecialProducts()
    });
};

export const useFeaturedProducts = () => {
    return useQuery({
        queryKey: ['shop_products_featured'],
        queryFn: () => shop.getFeaturedProducts()
    });
};

export const useRandomProducts = () => {
    return useQuery({
        queryKey: ['shop_products_random'],
        queryFn: () => shop.getRandomProducts()
    });
};

export const useStorefront = (slug: string, token?: string) => {
    return useQuery({
        queryKey: ['storefront', slug],
        queryFn: () => shop.getStorefront(slug, token),
        enabled: !!slug
    });
};

export const useProductDetails = (id: string) => {
    return useQuery({
        queryKey: ['shop_product', id],
        queryFn: () => shop.getProduct(id),
        enabled: !!id
    });
};

export const useTrackInteraction = () => {
    return useMutation({
        mutationFn: ({ vendorId, actionType, productId }: { vendorId: string, actionType: string, productId?: string }) =>
            shop.track(vendorId, actionType, productId)
    });
};

export const useWishlist = (userId?: string) => {
    return useQuery({
        queryKey: ['shop_wishlist', userId],
        queryFn: () => shop.getWishlist(userId!),
        enabled: !!userId
    });
};

export const useToggleWishlist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, productId, email }: { userId: string, productId: string, email?: string }) =>
            shop.toggleWishlist(userId, productId, email),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['shop_wishlist', variables.userId] });
            queryClient.invalidateQueries({ queryKey: ['shop_product', variables.productId] });
            queryClient.invalidateQueries({ queryKey: ['shop_product'] });
            queryClient.invalidateQueries({ queryKey: ['vendor_stats'] });
            queryClient.invalidateQueries({ queryKey: ['storefront'] });
        }
    });
};

export const useVendorProfile = (userId?: string) => {
    return useQuery({
        queryKey: ['vendor_profile', userId],
        queryFn: () => shop.getVendorMe(userId!),
        enabled: !!userId,
        staleTime: 60 * 1000,      // 1 minute tolerance (prevents layout shift on tab switching)
        refetchOnWindowFocus: false // Don't refetch just because user alt-tabbed
    });
};

export const useOnboardVendor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { user_id: string, nama_toko: string, slug: string, category_id: string, kota: string, deskripsi?: string }) =>
            shop.onboardVendor(data),
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: ['vendor_profile', variables.user_id] });
        }
    });
};

export const useUpdateVendorSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => shop.updateVendorSettings(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['vendor_profile'] });
        }
    });
};

export const useVendorProducts = (vendorId?: string) => {
    return useQuery({
        queryKey: ['vendor_products', vendorId],
        queryFn: () => shop.getVendorProducts(vendorId!),
        enabled: !!vendorId
    });
};

export const useCreateVendorProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => shop.createVendorProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendor_products'] });
        }
    });
};

export const useUpdateVendorProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => shop.updateVendorProduct({ id, data }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['vendor_products'] });
            queryClient.invalidateQueries({ queryKey: ['shop_product', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['shop_product'] });
        }
    });
};

export const useDeleteVendorProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => shop.deleteVendorProduct(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['vendor_products'] });
            queryClient.invalidateQueries({ queryKey: ['shop_product', id] });
            queryClient.invalidateQueries({ queryKey: ['shop_product'] });
        }
    });
};

export const useUpdateVendorProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ vendorId, userId, data }: { vendorId: string, userId: string, data: any }) =>
            shop.updateVendorProfile(vendorId, userId, data),
        onSuccess: async (_, variables) => {
            // Force immediate synchronization
            console.log('[Query] Profile update success, invalidating cache...');
            await queryClient.invalidateQueries({ queryKey: ['vendor_profile', variables.userId] });
            await queryClient.refetchQueries({ queryKey: ['vendor_profile', variables.userId] });
        }
    });
};

export const useUpdateProductStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, userId, status }: { productId: string, userId: string, status: string }) =>
            shop.updateProductStatus(productId, userId, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['vendor_products'] });
            queryClient.invalidateQueries({ queryKey: ['shop_product', variables.productId] });
            queryClient.invalidateQueries({ queryKey: ['shop_product'] });
            queryClient.invalidateQueries({ queryKey: ['storefront'] });
        }
    });
};

export const useShopCarousel = () => {
    return useQuery({
        queryKey: ['shop_carousel'],
        queryFn: () => shop.getCarousel()
    });
};

export const useAdminShopCarousel = (token: string) => {
    return useQuery({
        queryKey: ['admin_shop_carousel'],
        queryFn: () => shop.adminGetCarousel(token),
        enabled: !!token
    });
};

export const useAdminAddCarousel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, payload }: { token: string; payload: any }) => shop.adminAddCarousel(token, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_shop_carousel'] })
    });
};

export const useAdminDeleteCarousel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, id }: { token: string; id: string }) => shop.adminDeleteCarousel(token, id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_shop_carousel'] })
    });
};

export const useBoostVendor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ vendorId, userId }: { vendorId: string, userId: string }) =>
            shop.boostVendor(vendorId, userId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['vendor_profile', variables.userId] });
        }
    });
};

export const useVendorAnalytics = (vendorId?: string) => {
    return useQuery({
        queryKey: ['vendor_analytics', vendorId],
        queryFn: () => shop.getVendorAnalytics(vendorId!),
        enabled: !!vendorId,
        refetchInterval: 60000 // Refetch every minute for "Live" feel
    });
};

export const useVendorStats = (vendorId?: string) => {
    return useQuery({
        queryKey: ['vendor_stats', vendorId],
        queryFn: () => shop.getVendorStats(vendorId!),
        enabled: !!vendorId
    });
};

export const useSmartRecommendations = (productId?: string, category?: string) => {
    return useQuery({
        queryKey: ['shop_recommendations', productId],
        queryFn: () => shop.getRecommendations(productId!, category!),
        enabled: !!productId && !!category
    });
};

export const useAdCampaigns = (vendorId?: string) => {
    return useQuery({
        queryKey: ['ad_campaigns', vendorId],
        queryFn: () => shop.getAdCampaigns(vendorId!),
        enabled: !!vendorId
    });
};

export const useCreateAdCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: any) => shop.createAdCampaign(payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['ad_campaigns', variables.vendor_id] });
        }
    });
};

export const useUpdateAdCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => shop.updateAdCampaign(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ad_campaigns'] });
        }
    });
};

export const useTrackAdClick = () => {
    return useMutation({
        mutationFn: (adId: string) => shop.trackAdClick(adId)
    });
};

// ============================================
// ADMIN SHOP MANAGEMENT HOOKS
// ============================================

export const useAdminProducts = () => {
    const { user, token } = useStore();
    return useQuery({
        queryKey: ['admin_all_products'],
        queryFn: () => shop.adminGetAllProducts(token || user?.id || ''),
        enabled: !!(token || user?.id)
    });
};

export const useAdminDeleteProduct = () => {
    const { user, token } = useStore();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (productId: string) => shop.adminDeleteProduct(productId, token || user?.id || ''),
        onSuccess: (_, productId) => {
            queryClient.invalidateQueries({ queryKey: ['admin_all_products'] });
            queryClient.invalidateQueries({ queryKey: ['shop_product', productId] });
            queryClient.invalidateQueries({ queryKey: ['shop_product'] });
        }
    });
};

export const useAdminAddProduct = () => {
    const { user, token } = useStore();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => shop.adminAddProduct(data, token || user?.id || ''),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin_all_products'] });
            queryClient.invalidateQueries({ queryKey: ['shop_product'] });
        }
    });
};

export const useAdminUpdateProduct = () => {
    const { user, token } = useStore();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => shop.adminUpdateProduct(id, data, token || user?.id || ''),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin_all_products'] });
            queryClient.invalidateQueries({ queryKey: ['shop_product', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['shop_product'] });
        }
    });
};

export const useAdminUpdateVendor = () => {
    const { token } = useStore();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => admin.updateVendor(id, data, token || undefined),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shop_directory'] });
            queryClient.invalidateQueries({ queryKey: ['admin_all_vendors'] });
        }
    });
};

export const useAdminUpdateVendorBalance = () => {
    const { token } = useStore();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { amount: number; action: 'add' | 'subtract' | 'set' } }) =>
            admin.updateVendorBalance(id, payload, token || undefined),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin_all_vendors'] });
            toast.success('Saldo ads diperbarui');
        }
    });
};

export const useAdminVendors = () => {
    const { token } = useStore();
    return useQuery({
        queryKey: ['admin_all_vendors'],
        queryFn: () => admin.adminListVendors(token || undefined)
    });
};

export const useAdminApproveProduct = () => {
    const { user, token } = useStore();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string; is_approved: number; rejection_reason?: string }) => 
            shop.adminApproveProduct(token || user?.id || '', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin_all_products'] });
        }
    });
};

export const useSubmitReport = () => {
    return useMutation({
        mutationFn: (data: { product_id: string, reporter_id?: string, category: string, reason?: string }) => 
            shop.submitReport(data),
        onSuccess: () => {
            toast.success('Laporan Anda telah terkirim. Terima kasih atas kontribusi Anda.');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Gagal mengirim laporan. Silakan coba lagi nanti.');
        }
    });
};

export const useAdminShopReports = () => {
    const { token } = useStore();
    return useQuery({
        queryKey: ['admin_shop_reports'],
        queryFn: () => admin.getShopReports(token || undefined),
        enabled: !!token
    });
};

export const useUpdateReportStatus = () => {
    const { token } = useStore();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ reportId, status }: { reportId: string, status: string }) => 
            admin.updateShopReportStatus(reportId, status, token || undefined),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin_shop_reports'] });
            toast.success('Status laporan diperbarui');
        }
    });
};

export const useAdminAdCampaigns = () => {
    const { token } = useStore();
    return useQuery({
        queryKey: ['admin_ad_campaigns'],
        queryFn: () => admin.adminGetAdCampaigns(token || undefined),
        enabled: !!token
    });
};

export const useApproveAdCampaign = () => {
    const { token } = useStore();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string, is_approved: number, rejection_reason?: string }) => 
            admin.approveAdCampaign(payload.id, payload.is_approved, payload.rejection_reason, token || undefined),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['admin_ad_campaigns'] });
            await queryClient.refetchQueries({ queryKey: ['admin_ad_campaigns'] });
            toast.success('Kampanye iklan diperbarui');
        }
    });
};
