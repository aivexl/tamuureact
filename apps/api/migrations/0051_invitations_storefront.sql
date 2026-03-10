-- Migration: 0051_invitations_storefront.sql
-- Description: Infrastruktur Carousel Undangan & SEO Chronos Templates
-- Author: Tamuu CTO

-- 1. Create Invitations Carousel Table
CREATE TABLE IF NOT EXISTS invitations_carousel (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    image_url TEXT NOT NULL,
    link_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inv_car_active ON invitations_carousel(is_active);
CREATE INDEX IF NOT EXISTS idx_inv_car_order ON invitations_carousel(order_index);

-- 2. Seed Default Invitations Carousel Data
INSERT OR IGNORE INTO invitations_carousel (id, image_url, link_url, order_index) VALUES 
('def-inv-1', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000', '/invitations', 1),
('def-inv-2', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2000', '/invitations', 2);

-- 3. Seed SEO Templates untuk Invitations (Storefront)
-- Menggunakan tabel seo_templates yang sudah ada
-- Kita gunakan intent_type spesifik untuk undangan: 'INV_TREND', 'INV_PREMIUM', 'INV_CUSTOM'

-- Intent: INV_TREND (Kekinian / Terbaru)
INSERT INTO seo_templates (intent_type, section, content_template) VALUES
('INV_TREND', 'TITLE', 'Trend Undangan Digital {Category} Terbaru {Year} | Tamuu'),
('INV_TREND', 'TITLE', 'Koleksi Undangan Online {Category} Paling Hits {Month} {Year}'),
('INV_TREND', 'META_DESC', 'Temukan {Count}+ desain undangan digital dengan tema {Category} paling dicari di {Month} {Year}. Buat website pernikahan impian Anda sekarang.'),
('INV_TREND', 'META_DESC', 'Jangan ketinggalan zaman! Gunakan template undangan {Category} terbaru tahun {Year}. Elegan, cepat, dan mudah disebarkan ke semua tamu Anda.'),
('INV_TREND', 'H1', 'Koleksi Desain Undangan {Category} Terbaru {Year}');

-- Intent: INV_PREMIUM (Mewah / Kualitas Tinggi)
INSERT INTO seo_templates (intent_type, section, content_template) VALUES
('INV_PREMIUM', 'TITLE', 'Katalog Undangan Digital {Category} Eksklusif & Premium | Tamuu'),
('INV_PREMIUM', 'TITLE', '{Count} Template Undangan Pernikahan {Category} Mewah {Year}'),
('INV_PREMIUM', 'META_DESC', 'Hadirkan kesan berkelas untuk hari spesial Anda. Jelajahi {Count} template undangan {Category} premium kami yang dirancang khusus oleh desainer profesional di tahun {Year}.'),
('INV_PREMIUM', 'META_DESC', 'Katalog premium undangan online {Category}. Fitur lengkap, desain eksklusif, dan bebas watermark. Mulai buat undangan mewah Anda hari ini.'),
('INV_PREMIUM', 'H1', 'Desain Undangan Premium & Eksklusif Tema {Category}');

-- Intent: INV_CUSTOM (Personalisasi / Kemudahan)
INSERT INTO seo_templates (intent_type, section, content_template) VALUES
('INV_CUSTOM', 'TITLE', 'Buat Undangan Digital {Category} Sendiri - Mudah & Cepat | Tamuu'),
('INV_CUSTOM', 'TITLE', 'Edit Template Undangan {Category} Langsung Jadi (Update {Month})'),
('INV_CUSTOM', 'META_DESC', 'Pilih dari {Count} desain dasar {Category} dan sesuaikan dengan foto serta cerita Anda. Platform pembuat undangan online tercepat dan paling fleksibel di tahun {Year}.'),
('INV_CUSTOM', 'META_DESC', 'Tidak perlu keahlian coding. Pilih template {Category}, masukkan data, dan undangan digital Anda siap disebar dalam 5 menit. Coba sekarang!'),
('INV_CUSTOM', 'H1', 'Kustomisasi Desain Undangan {Category} Anda');
