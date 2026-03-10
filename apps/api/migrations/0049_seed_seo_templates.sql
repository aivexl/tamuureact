-- Migration: 0049_seed_seo_templates.sql
-- Description: Seeding data template Programmatic SEO
-- Author: Tamuu CTO (AI-Generated Batch)

-- Bersihkan data lama jika ada
DELETE FROM seo_templates;

-- ==========================================
-- INTENT: BEST (Terbaik / Premium / Rating Tinggi)
-- ==========================================
INSERT INTO seo_templates (intent_type, section, content_template) VALUES
('BEST', 'TITLE', '{Category} {City} Terbaik {Year} - Rating Bintang 5 | Tamuu'),
('BEST', 'TITLE', 'Top {Count} {Category} di {City} Paling Direkomendasikan ({Month} {Year})'),
('BEST', 'TITLE', 'Daftar {Category} {City} Kualitas Premium & Terbaik {Year}'),
('BEST', 'META_DESC', 'Mencari {Category} terbaik di {City}? Temukan {Count} pilihan vendor top-rated dengan portfolio memukau. Booking sekarang untuk acara impian Anda di {Year}.'),
('BEST', 'META_DESC', 'Bandingkan {Count} {Category} paling direkomendasikan di {City}. Dapatkan layanan premium dengan kepuasan pelanggan tertinggi. Cek daftarnya sekarang!'),
('BEST', 'H1', '{Category} Terbaik & Paling Direkomendasikan di {City}'),
('BEST', 'H1', 'Top {Category} Premium di {City} Tahun {Year}'),
('BEST', 'INTRO_BODY', 'Merencanakan acara sempurna di {City} membutuhkan vendor yang tepat. Kami telah mengkurasi {Count} {Category} terbaik dengan rating tertinggi dan ulasan memuaskan dari ratusan klien. Mulai dari layanan eksklusif hingga hasil portfolio kelas atas, temukan pilihan utama Anda di Tamuu untuk mewujudkan momen tak terlupakan.'),
('BEST', 'INTRO_BODY', 'Jangan kompromi untuk hari spesial Anda. Di wilayah {City}, terdapat {Count} vendor {Category} yang masuk dalam kategori "Premium Selection". Mereka telah terbukti memberikan pelayanan bintang lima dengan standar industri tertinggi di tahun {Year} ini.');

-- ==========================================
-- INTENT: CHEAP (Murah / Ekonomis / Hemat)
-- ==========================================
INSERT INTO seo_templates (intent_type, section, content_template) VALUES
('CHEAP', 'TITLE', 'Paket {Category} Murah di {City} Mulai {MinPrice} | Tamuu'),
('CHEAP', 'TITLE', '{Category} {City} Harga Terjangkau & Hemat Budget {Year}'),
('CHEAP', 'TITLE', '{Count} Pilihan {Category} Termurah di {City} (Update {Month})'),
('CHEAP', 'META_DESC', 'Cari {Category} murah di {City}? Kami punya {Count} rekomendasi vendor hemat budget mulai dari {MinPrice}. Kualitas tetap terjaga. Cek daftarnya untuk {Month} {Year}.'),
('CHEAP', 'META_DESC', 'Siapkan acara tanpa menguras kantong! Temukan daftar harga {Category} paling bersahabat di {City}, mulai dari {MinPrice}. Transparan & tanpa biaya tersembunyi.'),
('CHEAP', 'H1', 'Rekomendasi {Category} Murah & Berkualitas di {City}'),
('CHEAP', 'H1', 'Paket Hemat {Category} di {City} Mulai {MinPrice}'),
('CHEAP', 'INTRO_BODY', 'Siapa bilang mewujudkan acara impian harus mahal? Khusus di wilayah {City}, kami telah menemukan {Count} vendor {Category} dengan harga yang sangat bersahabat, mulai dari {MinPrice} saja. Pilihan ini sangat cocok untuk Anda yang ingin menghemat budget secara cerdas tanpa harus mengorbankan kualitas layanan.'),
('CHEAP', 'INTRO_BODY', 'Mengatur keuangan untuk event adalah hal krusial. Oleh karena itu, Tamuu menghadirkan direktori {Count} {Category} dengan harga paling kompetitif di {City}. Bandingkan paket hematnya dan dapatkan layanan maksimal dengan pengeluaran minimal.');

-- ==========================================
-- INTENT: PROMO (Bulan Ini / Diskon / Urgensi)
-- ==========================================
INSERT INTO seo_templates (intent_type, section, content_template) VALUES
('PROMO', 'TITLE', 'Promo {Category} {City} Eksklusif Bulan {Month} {Year} | Tamuu'),
('PROMO', 'TITLE', 'Diskon & Promo Paket {Category} di {City} (Update {Month})'),
('PROMO', 'TITLE', 'Flash Sale: {Category} di {City} Mulai {MinPrice}'),
('PROMO', 'META_DESC', 'Jangan lewatkan promo {Category} di {City} khusus bulan {Month} {Year}! Dapatkan penawaran spesial dari {Count} vendor dengan harga diskon mulai {MinPrice}.'),
('PROMO', 'META_DESC', 'Klaim diskon {Category} terbaik di {City} sebelum kehabisan! Berlaku selama {Month} {Year}. Booking lebih awal, hemat lebih banyak hanya di Tamuu.'),
('PROMO', 'H1', 'Promo Spesial {Category} di {City} - Berlaku {Month} {Year}'),
('PROMO', 'H1', 'Penawaran Terbatas: Diskon {Category} Wilayah {City}'),
('PROMO', 'INTRO_BODY', 'Kabar gembira untuk Anda! Di bulan {Month} {Year} ini, banyak vendor {Category} di {City} yang sedang mengadakan promo besar-besaran dan penawaran eksklusif. Jangan lewatkan kesempatan langka ini untuk mendapatkan layanan premium dari {Count} vendor pilihan dengan harga "Flash Sale" mulai dari {MinPrice}.'),
('PROMO', 'INTRO_BODY', 'Waktu yang tepat untuk melakukan booking adalah sekarang. Temukan {Count} {Category} di {City} yang sedang memberikan diskon spesial atau bonus tambahan khusus untuk pemesanan di bulan {Month} ini. Amankan kuota Anda sebelum slot penuh!');

-- ==========================================
-- INTENT: PRO (Profesional / Berpengalaman / Terpercaya)
-- ==========================================
INSERT INTO seo_templates (intent_type, section, content_template) VALUES
('PRO', 'TITLE', 'Vendor {Category} Profesional di {City} Paling Berpengalaman | Tamuu'),
('PRO', 'TITLE', '{Count} Jasa {Category} Terpercaya & Bersertifikat di {City}'),
('PRO', 'TITLE', 'Direktori {Category} Senior & Profesional se-{City} {Year}'),
('PRO', 'META_DESC', 'Butuh kepastian dan ketenangan pikiran? Pilih dari {Count} vendor {Category} profesional dan terpercaya di {City}. Pengalaman bertahun-tahun melayani ratusan klien.'),
('PRO', 'META_DESC', 'Anti gagal! Serahkan acara Anda pada ahlinya. Temukan profil, legalitas, dan review {Category} profesional di wilayah {City} hanya di platform terverifikasi Tamuu.'),
('PRO', 'H1', 'Vendor {Category} Profesional & Terpercaya di {City}'),
('PRO', 'H1', 'Ahli {Category} Berpengalaman di Wilayah {City}'),
('PRO', 'INTRO_BODY', 'Keberhasilan acara Anda ada di tangan ahlinya. Kami menampilkan daftar {Count} {Category} paling profesional di {City} yang telah memiliki jam terbang tinggi. Mereka adalah para vendor terverifikasi yang terbukti kredibel dalam menangani berbagai skala acara dengan hasil yang selalu memuaskan.'),
('PRO', 'INTRO_BODY', 'Jangan mengambil risiko untuk hari penting Anda. Percayakan pada {Count} penyedia jasa {Category} profesional di {City} yang tergabung di Tamuu. Dengan standar kerja tinggi, peralatan lengkap, dan tim solid, mereka siap menjamin acara Anda berjalan tanpa hambatan.');

-- ==========================================
-- INTENT: ESTETIK (Modern / Kekinian / Mewah)
-- ==========================================
INSERT INTO seo_templates (intent_type, section, content_template) VALUES
('ESTETIK', 'TITLE', '{Category} Estetik & Kekinian di {City} {Year} | Tamuu'),
('ESTETIK', 'TITLE', 'Vendor {Category} Modern, Unik & Elegan wilayah {City}'),
('ESTETIK', 'TITLE', 'Inspirasi {Category} Konsep Mewah & Estetik di {City}'),
('ESTETIK', 'META_DESC', 'Wujudkan konsep acara modern Anda dengan {Count} {Category} estetik di {City}. Portfolio visual memanjakan mata, cocok untuk gaya milenial & Gen-Z {Year}.'),
('ESTETIK', 'META_DESC', 'Suka konsep yang unik dan out-of-the-box? Lihat portfolio {Category} paling modern dan elegan di {City}. Tren desain terbaru tahun {Year} ada di sini!'),
('ESTETIK', 'H1', 'Pilihan {Category} Modern, Elegan & Estetik di {City}'),
('ESTETIK', 'H1', 'Trend {Category} Kekinian & Mewah di {City} {Year}'),
('ESTETIK', 'INTRO_BODY', 'Untuk Anda yang memiliki selera visual tinggi, kami telah menyusun direktori {Count} {Category} dengan sentuhan paling estetik dan kekinian di {City}. Vendor-vendor ini dikenal dengan gaya kreatif mereka yang mampu menyulap acara menjadi mahakarya visual yang Instagramable dan tak terlupakan.'),
('ESTETIK', 'INTRO_BODY', 'Mengikuti tren desain terbaru di tahun {Year}, daftar {Count} {Category} ini menawarkan konsep modern, minimalis, hingga rustic elegan di {City}. Jelajahi portfolio mereka untuk menemukan gaya yang paling merepresentasikan kepribadian unik Anda.');

-- Seed City Metadata (Contoh 5 Kota Teratas, bisa ditambah nanti)
INSERT INTO seo_city_metadata (city_name, province, local_fact) VALUES
('Jakarta', 'DKI Jakarta', 'Pusat metropolitan dengan standar vendor premium'),
('Bandung', 'Jawa Barat', 'Kota kreatif dengan tren pernikahan estetik tertinggi'),
('Surabaya', 'Jawa Timur', 'Kota pahlawan dengan vendor berpengalaman luas'),
('Cirebon', 'Jawa Barat', 'Kota udang dengan perpaduan budaya tradisional dan modern'),
('Bali', 'Bali', 'Destinasi pernikahan internasional nomor satu di Indonesia');
