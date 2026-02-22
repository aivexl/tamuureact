-- Seeding Shop Master Data V9
-- Categories
INSERT OR IGNORE INTO shop_category (id, nama_kategori, slug_kategori) VALUES 
('cat-001', 'MUA', 'mua'),
('cat-002', 'Wedding Organizer', 'wedding-organizer'),
('cat-003', 'Catering', 'catering'),
('cat-004', 'Fotografi', 'fotografi'),
('cat-005', 'Dekorasi', 'dekorasi'),
('cat-006', 'Venue', 'venue');

-- Create a dummy user for the merchant if not exists
INSERT OR IGNORE INTO users (id, email, name) VALUES 
('user-merchant-001', 'merchant@nusantara.id', 'Nusantara Admin');

-- Merchant: Nusantara Wedding Organizer
INSERT OR IGNORE INTO shop_merchants (id, user_id, slug, nama_toko, deskripsi, deskripsi_panjang, category_id, logo_url, banner_url, is_verified) VALUES 
('merch-001', 'user-merchant-001', 'nusantara-wedding', 'Nusantara Wedding Organizer', 'Layanan koordinasi pernikahan profesional & berkelas.', 'Kami menyediakan solusi lengkap untuk pernikahan impian Anda, mulai dari perencanaan hingga pelaksanaan di hari-H.', 'cat-002', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80', 1);

-- Merchant Contacts
INSERT OR IGNORE INTO shop_contacts (merchant_id, alamat, kota, whatsapp, instagram, email, jam_operasional) VALUES 
('merch-001', 'Jl. Sudirman No. 123', 'Jakarta Selatan', '628123456789', 'nusantarawedding', 'info@nusantara.id', 'Mon-Fri 09:00 - 18:00');

-- Products
INSERT OR IGNORE INTO shop_products (id, merchant_id, nama_produk, deskripsi, harga_estimasi, status, is_ad_sponsored) VALUES 
('prod-001', 'merch-001', 'Paket Pernikahan Intimate', 'Paket lengkap untuk 100 tamu undangan dengan standar protokol kesehatan.', 'Rp 25.000.000', 'PUBLISHED', 1),
('prod-002', 'merch-001', 'Wedding Photography & Video', 'Dokumentasi premium dengan tim profesional dan perlengkapan tingkat tinggi.', 'Rp 15.000.000', 'PUBLISHED', 0),
('prod-003', 'merch-001', 'Dekorasi Pelaminan Modern', 'Dekorasi bunga segar dengan konsep modern minimalis atau tradisional.', 'Rp 35.000.000', 'PUBLISHED', 0);

-- Product Images
INSERT OR IGNORE INTO shop_product_images (id, product_id, image_url, order_index) VALUES 
('img-001', 'prod-001', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80', 0),
('img-002', 'prod-002', 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80', 0),
('img-003', 'prod-003', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80', 0);
