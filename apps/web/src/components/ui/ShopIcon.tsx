import React from 'react';
import * as Icons from 'lucide-react';
import { 
    LayoutGrid, Sparkles, Heart, Utensils, Camera, 
    Palette, Building2, Music, Gift, Tag, 
    Users, Briefcase, Glasses, Flower2, Cake, 
    Car, Plane, Home, MapPin, Phone, 
    MessageCircle, Mail, Instagram, Facebook, Globe,
    ShoppingBag, Store, Star, Zap, Shield, 
    Search, Filter, List, Grid, Image
} from 'lucide-react';

export type ShopIconName = keyof typeof Icons | string;

interface ShopIconProps {
    name: ShopIconName;
    size?: number;
    className?: string;
}

/**
 * Universal Icon Resolver for Tamuu Shop
 * Uses Lucide React icons
 */
export const ShopIcon: React.FC<ShopIconProps> = ({ name, size = 20, className }) => {
    // Dynamic lookup from Lucide icons
    const IconComponent = (Icons as any)[name];
    
    if (IconComponent) {
        return <IconComponent size={size} className={className} />;
    }

    // Fallback icon
    return <LayoutGrid size={size} className={className} />;
};

/**
 * List of recommended icons for Shop Categories
 */
export const RECOMMENDED_SHOP_ICONS = [
    { name: 'LayoutGrid', label: 'Default' },
    { name: 'Sparkles', label: 'MUA / Beauty' },
    { name: 'Heart', label: 'Wedding Organizer' },
    { name: 'Utensils', label: 'Catering / Food' },
    { name: 'Camera', label: 'Photography' },
    { name: 'Palette', label: 'Decoration' },
    { name: 'Building2', label: 'Venue' },
    { name: 'Music', label: 'Entertainment' },
    { name: 'Gift', label: 'Souvenir' },
    { name: 'Glasses', label: 'Fashion / Attire' },
    { name: 'Flower2', label: 'Florist' },
    { name: 'Cake', label: 'Cake / Dessert' },
    { name: 'Car', label: 'Transportation' },
    { name: 'Users', label: 'Guest Management' },
    { name: 'Briefcase', label: 'Professional' },
    { name: 'ShoppingBag', label: 'Shopping' },
    { name: 'Store', label: 'Store' },
    { name: 'Star', label: 'Featured' },
    { name: 'Tag', label: 'Label' },
    { name: 'Globe', label: 'Global' },
];
