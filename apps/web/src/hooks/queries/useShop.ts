import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shop } from '../../lib/api';

export const useShopDirectory = (category?: string, query?: string) => {
    return useQuery({
        queryKey: ['shop_directory', category, query],
        queryFn: () => shop.getDirectory(category, query)
    });
};

export const useProductDiscovery = (options: { category?: string; query?: string; city?: string }) => {
    return useQuery({
        queryKey: ['shop_product_discovery', options.category, options.query, options.city],
        queryFn: () => shop.getDiscoverProducts(options)
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
        mutationFn: ({ merchantId, actionType, productId }: { merchantId: string, actionType: string, productId?: string }) =>
            shop.track(merchantId, actionType, productId)
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
        mutationFn: ({ userId, productId }: { userId: string, productId: string }) =>
            shop.toggleWishlist(userId, productId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['shop_wishlist', variables.userId] });
        }
    });
};

export const useMerchantProfile = (userId?: string) => {
    return useQuery({
        queryKey: ['merchant_profile', userId],
        queryFn: () => shop.getMerchantMe(userId!),
        enabled: !!userId,
        staleTime: 0,              // Always refetch — never trust cache for auth-critical data
        gcTime: 0,                 // Don't keep stale entries across navigations
        refetchOnMount: 'always',  // Force refetch on every mount (critical after onboarding redirect)
        retry: 2                   // Retry on transient network errors
    });
};

export const useOnboardMerchant = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { user_id: string, nama_toko: string, slug: string, category_id: string, kota: string, deskripsi?: string }) =>
            shop.onboardMerchant(data),
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: ['merchant_profile', variables.user_id] });
        }
    });
};

export const useUpdateMerchantSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => shop.updateMerchantSettings(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['merchant_profile'] });
        }
    });
};

export const useMerchantProducts = (merchantId?: string) => {
    return useQuery({
        queryKey: ['merchant_products', merchantId],
        queryFn: () => shop.getMerchantProducts(merchantId!),
        enabled: !!merchantId
    });
};

export const useCreateMerchantProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => shop.createMerchantProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchant_products'] });
        }
    });
};

export const useUpdateMerchantProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => shop.updateMerchantProduct({ id, data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchant_products'] });
            queryClient.invalidateQueries({ queryKey: ['shop_product'] });
        }
    });
};

export const useDeleteMerchantProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => shop.deleteMerchantProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchant_products'] });
        }
    });
};

export const useUpdateMerchantProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ merchantId, userId, data }: { merchantId: string, userId: string, data: any }) =>
            shop.updateMerchantProfile(merchantId, userId, data),
        onSuccess: async (_, variables) => {
            // Aggressive re-fetch across all related keys
            await queryClient.invalidateQueries({ queryKey: ['merchant_profile', variables.userId] });
            await queryClient.invalidateQueries({ queryKey: ['storefront'] });
            await queryClient.refetchQueries({ queryKey: ['merchant_profile', variables.userId] });
        }
    });
};

export const useUpdateProductStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, userId, status }: { productId: string, userId: string, status: string }) =>
            shop.updateProductStatus(productId, userId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchant_products'] });
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

export const useBoostShop = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ merchantId, userId }: { merchantId: string, userId: string }) =>
            shop.boostShop(merchantId, userId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['merchant_profile', variables.userId] });
        }
    });
};

export const useMerchantAnalytics = (merchantId?: string) => {
    return useQuery({
        queryKey: ['merchant_analytics', merchantId],
        queryFn: () => shop.getMerchantAnalytics(merchantId!),
        enabled: !!merchantId,
        refetchInterval: 60000 // Refetch every minute for "Live" feel
    });
};

export const useMerchantStats = (merchantId?: string) => {
    return useQuery({
        queryKey: ['merchant_stats', merchantId],
        queryFn: () => shop.getMerchantStats(merchantId!),
        enabled: !!merchantId
    });
};

export const useSmartRecommendations = (productId?: string, category?: string) => {
    return useQuery({
        queryKey: ['shop_recommendations', productId],
        queryFn: () => shop.getRecommendations(productId!, category!),
        enabled: !!productId && !!category
    });
};
