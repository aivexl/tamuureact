-- ============================================
-- TAMUU - D1 SEED: EXPANDED MUSIC LIBRARY (50 TRACKS)
-- ============================================

-- TRADITIONAL INDONESIAN
INSERT OR IGNORE INTO music_library (id, title, artist, url, category, duration, is_premium, source_type) VALUES
('tr-1', 'Sabilulungan', 'Degung Sunda', 'https://api.tamuu.id/assets/music/tr-sabilulungan.mp3', 'Traditional', '3:45', 0, 'library'),
('tr-2', 'Kayu Manis', 'Gamelan Jawa', 'https://api.tamuu.id/assets/music/tr-kayumanis.mp3', 'Traditional', '4:20', 0, 'library'),
('tr-3', 'Semar Pagulingan', 'Gamelan Bali', 'https://api.tamuu.id/assets/music/tr-bali.mp3', 'Traditional', '5:10', 0, 'library'),
('tr-4', 'Salatun', 'Minang Fusion', 'https://api.tamuu.id/assets/music/tr-minang.mp3', 'Traditional', '3:50', 0, 'library'),
('tr-5', 'Zapin Melayu', 'Riau Ensemble', 'https://api.tamuu.id/assets/music/tr-zapin.mp3', 'Traditional', '4:15', 0, 'library'),
('tr-6', 'Gondang Batak Modern', 'Toba Ethno', 'https://api.tamuu.id/assets/music/tr-batak.mp3', 'Traditional', '4:30', 0, 'library'),
('tr-7', 'Anging Mammiri', 'Makassar Strings', 'https://api.tamuu.id/assets/music/tr-makassar.mp3', 'Traditional', '3:55', 0, 'library'),
('tr-8', 'Apuse Instrumental', 'Papuan Ethno', 'https://api.tamuu.id/assets/music/tr-papua.mp3', 'Traditional', '3:20', 0, 'library'),
('tr-9', 'Bubuy Bulan', 'Degung Harmony', 'https://api.tamuu.id/assets/music/tr-bubuy.mp3', 'Traditional', '4:05', 0, 'library'),
('tr-10', 'Manuk Dadali', 'Sunda Modern', 'https://api.tamuu.id/assets/music/tr-manuk.mp3', 'Traditional', '3:30', 0, 'library');

-- INSTRUMENTAL POP & WEDDING CLASSICS
INSERT OR IGNORE INTO music_library (id, title, artist, url, category, duration, is_premium, source_type) VALUES
('pop-1', 'Beautiful in White (Piano)', 'Wedding Piano', 'https://api.tamuu.id/assets/music/pop-biw.mp3', 'Instrumental', '4:10', 0, 'library'),
('pop-2', 'A Thousand Years (Violin)', 'Classic Strings', 'https://api.tamuu.id/assets/music/pop-aty.mp3', 'Instrumental', '4:45', 0, 'library'),
('pop-3', 'Perfect (Cello)', 'Modern Cello', 'https://api.tamuu.id/assets/music/pop-perfect.mp3', 'Instrumental', '4:23', 0, 'library'),
('pop-4', 'Cant Help Falling In Love', 'Vintage Piano', 'https://api.tamuu.id/assets/music/pop-chfil.mp3', 'Instrumental', '3:15', 0, 'library'),
('pop-5', 'Everything I Do', 'Romantic Guitar', 'https://api.tamuu.id/assets/music/pop-eid.mp3', 'Instrumental', '4:05', 0, 'library'),
('pop-6', 'Hallelujah (Piano)', 'Soulful Keys', 'https://api.tamuu.id/assets/music/pop-hallelujah.mp3', 'Instrumental', '3:50', 0, 'library'),
('pop-7', 'Marry Me (Acoustic)', 'Simple Strings', 'https://api.tamuu.id/assets/music/pop-marryme.mp3', 'Instrumental', '3:40', 0, 'library'),
('pop-8', 'All of Me (Piano)', 'Love Ballad', 'https://api.tamuu.id/assets/music/pop-allofme.mp3', 'Instrumental', '4:30', 0, 'library'),
('pop-9', 'Wildest Dreams (String)', 'Bridgerton Vibes', 'https://api.tamuu.id/assets/music/pop-wildest.mp3', 'Instrumental', '3:55', 0, 'library'),
('pop-10', 'Rewrite the Stars', 'Celestial Piano', 'https://api.tamuu.id/assets/music/pop-rewrite.mp3', 'Instrumental', '3:35', 0, 'library');

-- ACOUSTIC & CHILL
INSERT OR IGNORE INTO music_library (id, title, artist, url, category, duration, is_premium, source_type) VALUES
('ac-1', 'Morning Coffee', 'Acoustic Soul', 'https://assets.mixkit.co/music/preview/mixkit-morning-coffee-12.mp3', 'Acoustic', '2:45', 0, 'library'),
('ac-2', 'Lazy Sunday', 'Chill Guitar', 'https://assets.mixkit.co/music/preview/mixkit-lazy-sunday-135.mp3', 'Acoustic', '3:10', 0, 'library'),
('ac-3', 'Beach Breeze', 'Island Ukulele', 'https://assets.mixkit.co/music/preview/mixkit-beach-breeze-372.mp3', 'Acoustic', '2:55', 0, 'library'),
('ac-4', 'Forest Path', 'Nature Piano', 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3', 'Acoustic', '4:15', 0, 'library'),
('ac-5', 'Gentle Rain', 'Soft Keys', 'https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3', 'Acoustic', '3:40', 0, 'library'),
('ac-6', 'Sunset Glow', 'Warm Guitar', 'https://assets.mixkit.co/music/preview/mixkit-sunshine-342.mp3', 'Acoustic', '3:20', 0, 'library'),
('ac-7', 'Mountain Air', 'Crisp Acoustic', 'https://assets.mixkit.co/music/preview/mixkit-mountain-air-321.mp3', 'Acoustic', '3:05', 0, 'library'),
('ac-8', 'River Flow', 'Ambient Piano', 'https://assets.mixkit.co/music/preview/mixkit-river-flow-211.mp3', 'Acoustic', '4:00', 0, 'library'),
('ac-9', 'Starry Night', 'Starlight Guitar', 'https://assets.mixkit.co/music/preview/mixkit-starry-night-101.mp3', 'Acoustic', '3:50', 0, 'library'),
('ac-10', 'Meadow Walk', 'Happy Folk', 'https://assets.mixkit.co/music/preview/mixkit-meadow-walk-99.mp3', 'Acoustic', '2:50', 0, 'library');

-- CLASSICAL GEMS
INSERT OR IGNORE INTO music_library (id, title, artist, url, category, duration, is_premium, source_type) VALUES
('cl-1', 'Canon in D', 'Pachelbel', 'https://api.tamuu.id/assets/music/classic-canon.mp3', 'Classic', '5:30', 0, 'library'),
('cl-2', 'Air on the G String', 'Bach', 'https://api.tamuu.id/assets/music/classic-bach-air.mp3', 'Classic', '4:45', 0, 'library'),
('cl-3', 'Clair de Lune', 'Debussy', 'https://api.tamuu.id/assets/music/classic-clair.mp3', 'Classic', '5:10', 0, 'library'),
('cl-4', 'Moonlight Sonata', 'Beethoven', 'https://api.tamuu.id/assets/music/classic-moonlight.mp3', 'Classic', '6:00', 0, 'library'),
('cl-5', 'Ave Maria', 'Schubert', 'https://api.tamuu.id/assets/music/classic-ave-maria.mp3', 'Classic', '4:15', 0, 'library'),
('cl-6', 'Spring (Vivaldi)', 'The Four Seasons', 'https://api.tamuu.id/assets/music/classic-vivaldi-spring.mp3', 'Classic', '3:40', 0, 'library'),
('cl-7', 'The Swan', 'Saint-Saëns', 'https://api.tamuu.id/assets/music/classic-swan.mp3', 'Classic', '3:25', 0, 'library'),
('cl-8', 'Minuet in G', 'Bach', 'https://api.tamuu.id/assets/music/classic-minuet.mp3', 'Classic', '2:50', 0, 'library'),
('cl-9', 'Nessun Dorma', 'Puccini', 'https://api.tamuu.id/assets/music/classic-nessun.mp3', 'Classic', '4:05', 0, 'library'),
('cl-10', 'Wedding March', 'Mendelssohn', 'https://api.tamuu.id/assets/music/classic-wedding-march.mp3', 'Classic', '4:30', 0, 'library');

-- MODERN & UPBEAT
INSERT OR IGNORE INTO music_library (id, title, artist, url, category, duration, is_premium, source_type) VALUES
('mod-1', 'Golden Hour Lo-Fi', 'Tamuu Beats', 'https://api.tamuu.id/assets/music/mix-lofi.mp3', 'Modern', '3:40', 0, 'library'),
('mod-2', 'Tech House Vibes', 'Digital Pulse', 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3', 'Modern', '3:15', 0, 'library'),
('mod-3', 'Neon City', 'Synth Wave', 'https://assets.mixkit.co/music/preview/mixkit-neon-city-432.mp3', 'Modern', '3:50', 0, 'library'),
('mod-4', 'Summer Party', 'Dance Floor', 'https://assets.mixkit.co/music/preview/mixkit-summer-party-543.mp3', 'Modern', '4:10', 0, 'library'),
('mod-5', 'Deep Focus', 'Ambient Pad', 'https://assets.mixkit.co/music/preview/mixkit-deep-focus-654.mp3', 'Modern', '5:00', 0, 'library'),
('mod-6', 'Urban Beat', 'Hip Hop Instrumental', 'https://assets.mixkit.co/music/preview/mixkit-urban-beat-765.mp3', 'Modern', '3:25', 0, 'library'),
('mod-7', 'Chill Step', 'Liquid DnB', 'https://assets.mixkit.co/music/preview/mixkit-chill-step-876.mp3', 'Modern', '4:40', 0, 'library'),
('mod-8', 'Vibrant Soul', 'Neo Soul', 'https://assets.mixkit.co/music/preview/mixkit-vibrant-soul-987.mp3', 'Modern', '3:30', 0, 'library'),
('mod-9', 'Sky High', 'Electro Pop', 'https://assets.mixkit.co/music/preview/mixkit-sky-high-098.mp3', 'Modern', '3:45', 0, 'library'),
('mod-10', 'Cyber World', 'Future Bass', 'https://assets.mixkit.co/music/preview/mixkit-cyber-world-123.mp3', 'Modern', '4:05', 0, 'library');
