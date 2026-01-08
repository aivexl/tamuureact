-- ============================================
-- TAMUU - D1 SEED: MUSIC LIBRARY (BATCH 1)
-- ============================================

-- TRADITIONAL INDONESIAN (BATCH 1)
INSERT INTO music_library (id, title, artist, url, category, duration, is_premium, source_type) VALUES
('tr-1', 'Sabilulungan (Instrumental)', 'Degung Sunda', 'https://api.tamuu.id/assets/music/tr-sabilulungan.mp3', 'Traditional', '3:45', 0, 'library'),
('tr-2', 'Kayu Manis', 'Gamelan Jawa', 'https://api.tamuu.id/assets/music/tr-kayumanis.mp3', 'Traditional', '4:20', 0, 'library'),
('tr-3', 'Semar Pagulingan', 'Gamelan Bali', 'https://api.tamuu.id/assets/music/tr-bali.mp3', 'Traditional', '5:10', 0, 'library'),
('tr-4', 'Salatun', 'Minang Fusion', 'https://api.tamuu.id/assets/music/tr-minang.mp3', 'Traditional', '3:50', 0, 'library'),
('tr-5', 'Zapin Melayu', 'Riau Ensemble', 'https://api.tamuu.id/assets/music/tr-zapin.mp3', 'Traditional', '4:15', 0, 'library'),
('tr-6', 'Gondang Batak Modern', 'Toba Ethno', 'https://api.tamuu.id/assets/music/tr-batak.mp3', 'Traditional', '4:30', 0, 'library'),
('tr-7', 'Anging Mammiri', 'Makassar Strings', 'https://api.tamuu.id/assets/music/tr-makassar.mp3', 'Traditional', '3:55', 0, 'library'),
('tr-8', 'Apuse Instrumental', 'Papuan Ethno', 'https://api.tamuu.id/assets/music/tr-papua.mp3', 'Traditional', '3:20', 0, 'library');

-- INSTRUMENTAL POP (BATCH 1)
INSERT INTO music_library (id, title, artist, url, category, duration, is_premium, source_type) VALUES
('pop-1', 'Beautiful in White (Piano)', 'Wedding Piano', 'https://api.tamuu.id/assets/music/pop-biw.mp3', 'Instrumental', '4:10', 0, 'library'),
('pop-2', 'A Thousand Years (Violin)', 'Classic Strings', 'https://api.tamuu.id/assets/music/pop-aty.mp3', 'Instrumental', '4:45', 0, 'library'),
('pop-3', 'Perfect (Cello)', 'Modern Cello', 'https://api.tamuu.id/assets/music/pop-perfect.mp3', 'Instrumental', '4:23', 0, 'library'),
('pop-4', 'Cant Help Falling In Love', 'Vintage Piano', 'https://api.tamuu.id/assets/music/pop-chfil.mp3', 'Instrumental', '3:15', 0, 'library'),
('pop-5', 'Everything I Do', 'Romantic Guitar', 'https://api.tamuu.id/assets/music/pop-eid.mp3', 'Instrumental', '4:05', 0, 'library');

-- MIXED ESSENTIALS
INSERT INTO music_library (id, title, artist, url, category, duration, is_premium, source_type) VALUES
('mix-1', 'Canon in D', 'Pachelbel Classic', 'https://api.tamuu.id/assets/music/classic-canon.mp3', 'Classic', '5:30', 0, 'library'),
('mix-2', 'Golden Hour Lo-Fi', 'Tamuu Beats', 'https://api.tamuu.id/assets/music/mix-lofi.mp3', 'Modern', '3:40', 0, 'library');
