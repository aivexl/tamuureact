import { CategoryItem, Product, Ad, BlogPost, Vendor } from '../../constants/types';

export interface ShopPageParams {
    category?: string;
    city?: string;
    intent?: string;
}

export interface SEOContent {
    title: string;
    description: string;
    h1: string;
}

export interface AdsResponse {
    ads: Ad[];
}

export interface BlogResponse {
    posts: BlogPost[];
}
