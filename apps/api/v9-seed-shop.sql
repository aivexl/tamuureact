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
INSERT OR IGNORE INTO shop_products (id, merchant_id, nama_produk, deskripsi, harga_estimasi, status, is_ad_sponsored, slug, kategori_produk, kota) VALUES 
('prod-001', 'merch-001', 'Paket Pernikahan Intimate', 'Paket lengkap untuk 100 tamu undangan dengan standar protokol kesehatan.', 'Rp 25.000.000', 'PUBLISHED', 1, 'paket-pernikahan-intimate', 'Wedding Organizer', 'Jakarta Selatan'),
('prod-002', 'merch-001', 'Wedding Photography & Video', 'Dokumentasi premium dengan tim profesional dan perlengkapan tingkat tinggi.', 'Rp 15.000.000', 'PUBLISHED', 0, 'wedding-photography-video', 'Wedding Organizer', 'Jakarta Selatan'),
('prod-003', 'merch-001', 'Dekorasi Pelaminan Modern', 'Dekorasi bunga segar dengan konsep modern minimalis atau tradisional.', 'Rp 35.000.000', 'PUBLISHED', 0, 'dekorasi-pelaminan-modern', 'Wedding Organizer', 'Jakarta Selatan'),
('prod-004', 'merch-001', 'Paket Wedding Planner Silver', 'Layanan perencanaan pernikahan dasar mencakup konsultasi vendor, manajemen anggaran, dan koordinasi hari-H untuk 200 tamu.', 'Rp 12.500.000', 'PUBLISHED', 0, 'paket-wedding-planner-silver', 'Wedding Organizer', 'Jakarta Selatan'),
('prod-005', 'merch-001', 'Wedding Day Coordinator (On-the-day)', 'Tim profesional yang akan mengelola seluruh rangkaian acara di hari pernikahan Anda agar berjalan mulus tanpa kendala.', 'Rp 7.500.000', 'PUBLISHED', 0, 'wedding-day-coordinator', 'Wedding Organizer', 'Jakarta Selatan'),
('prod-006', 'merch-001', 'Paket Dokumentasi Pre-Wedding', 'Sesi foto pre-wedding 1 hari di lokasi outdoor pilihan dengan 2 kostum dan hasil album premium.', 'Rp 5.500.000', 'PUBLISHED', 0, 'paket-dokumentasi-pre-wedding', 'Wedding Organizer', 'Jakarta Selatan'),
('prod-007', 'merch-001', 'Dekorasi Akad Nikah / Pemberkatan', 'Set dekorasi elegan untuk prosesi akad nikah atau pemberkatan, termasuk meja akad, kursi, dan backdrop bunga segar.', 'Rp 10.000.000', 'PUBLISHED', 0, 'dekorasi-akad-nikah', 'Wedding Organizer', 'Jakarta Selatan'),
('prod-008', 'merch-001', 'Sewa Gaun Pengantin & Tuxedo Premium', 'Koleksi gaun pengantin internasional dan tuxedo pengantin pria dengan kualitas bahan terbaik dan fitting custom.', 'Rp 8.500.000', 'PUBLISHED', 0, 'sewa-gaun-pengantin', 'Wedding Organizer', 'Jakarta Selatan'),
('prod-009', 'merch-001', 'Paket Catering Nusantara (500 Pax)', 'Sajian menu nusantara pilihan dengan standar hotel berbintang, termasuk gubukan dan buffet utama.', 'Rp 55.000.000', 'PUBLISHED', 0, 'paket-catering-nusantara', 'Wedding Organizer', 'Jakarta Selatan');

-- Product Images
INSERT OR IGNORE INTO shop_product_images (id, product_id, image_url, order_index) VALUES 
('img-001', 'prod-001', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80', 0),
('img-002', 'prod-002', 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80', 0),
('img-003', 'prod-003', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80', 0),
('img-004', 'prod-004', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80', 0),
('img-005', 'prod-005', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80', 0),
('img-006', 'prod-006', 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80', 0),
('img-007', 'prod-007', 'https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&q=80', 0),
('img-008', 'prod-008', 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&q=80', 0),
('img-009', 'prod-009', 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80', 0);
