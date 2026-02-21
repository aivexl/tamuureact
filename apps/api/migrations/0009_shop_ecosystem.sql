-- Tamuu Nexus B2B2C Shop Architecture
-- Migration: 0009_shop_ecosystem.sql
-- Description: Creates the core tables for the Merchant, Product, Category, and Analytics modules.

-- 1. shop_category: Master data for industry classification
CREATE TABLE IF NOT EXISTS shop_category (
    id TEXT PRIMARY KEY,
    nama_kategori TEXT NOT NULL,
    slug_kategori TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. shop_merchants: 1-to-1 relationship with auth users to become a seller
CREATE TABLE IF NOT EXISTS shop_merchants (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE, -- The [namastore]
    nama_toko TEXT NOT NULL,
    deskripsi TEXT, -- Short description for cards
    deskripsi_panjang TEXT, -- Full description for Overview tab
    category_id TEXT NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    is_verified INTEGER DEFAULT 0, -- 0: False, 1: True
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES shop_category(id)
);
CREATE INDEX IF NOT EXISTS idx_shop_merchants_slug ON shop_merchants(slug);
CREATE INDEX IF NOT EXISTS idx_shop_merchants_user_id ON shop_merchants(user_id);

-- 3. shop_contacts: Separated for security/Curiosity Gap parsing
CREATE TABLE IF NOT EXISTS shop_contacts (
    merchant_id TEXT PRIMARY KEY,
    alamat TEXT,
    kota TEXT,
    whatsapp TEXT,
    instagram TEXT,
    email TEXT,
    jam_operasional TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(merchant_id) REFERENCES shop_merchants(id) ON DELETE CASCADE
);

-- 4. shop_products: The core inventory/service offering
CREATE TABLE IF NOT EXISTS shop_products (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    nama_produk TEXT NOT NULL,
    deskripsi TEXT NOT NULL,
    harga_estimasi TEXT, -- Allow text like "Mulai dari Rp 5.000.000"
    status TEXT DEFAULT 'DRAFT', -- DRAFT or PUBLISHED
    is_ad_sponsored INTEGER DEFAULT 0, -- 0: False, 1: True (For monetized listings)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(merchant_id) REFERENCES shop_merchants(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_shop_products_merchant ON shop_products(merchant_id);

-- 5. shop_product_images: Ordered photo carousels
CREATE TABLE IF NOT EXISTS shop_product_images (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES shop_products(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON shop_product_images(product_id, order_index);

-- 6. shop_wishlist: The 'Love' feature implementation
CREATE TABLE IF NOT EXISTS shop_wishlist (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id), -- Prevent duplicate likes
    FOREIGN KEY(product_id) REFERENCES shop_products(id) ON DELETE CASCADE
);

-- 7. shop_analytics: Fortune 500 engagement tracking
CREATE TABLE IF NOT EXISTS shop_analytics (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    action_type TEXT NOT NULL, -- VIEW_PROFILE, CLICK_CONTACT, SHARE_PRODUCT, FAVORITE_PRODUCT, VIEW_PRODUCT
    metadata TEXT, -- Optional JSON string for extra context (e.g., product_id)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(merchant_id) REFERENCES shop_merchants(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_shop_analytics_merchant_action ON shop_analytics(merchant_id, action_type);
