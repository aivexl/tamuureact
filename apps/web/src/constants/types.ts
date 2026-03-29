export interface Product {
    id: string;
    vendor_id: string;
    nama_produk: string;
    deskripsi: string;
    harga_estimasi: number;
    status: string;
    kategori_produk: string;
    kota: string;
    slug: string;
    images?: { image_url: string }[];
    nama_toko?: string;
    vendor_slug?: string;
    logo_url?: string;
    wishlist_count?: number;
    avg_rating?: number;
    review_count?: number;
    is_special?: number;
    is_featured?: number;
    is_landing_featured?: number;
    is_admin_listing?: number;
    custom_store_name?: string;
    isAd?: boolean;
    productId?: string; // For ads mapping
    url?: string;
}

export interface Vendor {
    id: string;
    user_id: string;
    slug: string;
    nama_toko: string;
    deskripsi: string;
    logo_url: string;
    banner_url: string;
    is_verified: number;
    is_sponsored: number;
    is_landing_featured?: number;
    kota: string;
    nama_kategori?: string;
    wishlist_count?: number;
    avg_rating?: number;
    review_count?: number;
}

export interface Ad {
    id: string;
    target_id: string;
    title: string;
    image_url: string;
    link_url?: string;
    position: string;
    vendor_slug: string;
    product_slug?: string;
    nama_produk?: string;
    harga_estimasi?: number;
    nama_toko?: string;
    logo_url?: string;
    avg_rating?: number;
    review_count?: number;
    wishlist_count?: number;
    kota?: string;
}

export interface CarouselSlide {
    id: string;
    image_url: string;
    link_url?: string;
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    featured_image?: string;
    category?: string | { name: string };
    created_at: string;
}

export interface CategoryItem {
    name: string;
    icon: any; // Lucide icon component
    slug: string;
}
