/**
 * Symphony Blueprint Music Seeder
 * Downloads royalty-free music and uploads to R2 + D1
 */

const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');
const path = require('path');

// 35 Track Library according to Symphony Blueprint
const TRACKS = [
    // ========== TRADITIONAL INDONESIAN (25) ==========
    { id: 'tr-01', title: 'Sabilulungan', artist: 'Degung Sunda', category: 'Traditional', duration: '3:45', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 'tr-02', title: 'Bubuy Bulan', artist: 'Kacapi Suling', category: 'Traditional', duration: '4:10', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 'tr-03', title: 'Manuk Dadali', artist: 'Sunda Modern', category: 'Traditional', duration: '3:30', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: 'tr-04', title: 'Es Lilin', artist: 'Gamelan Jawa', category: 'Traditional', duration: '4:20', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { id: 'tr-05', title: 'Suwe Ora Jamu', artist: 'Keroncong Jawa', category: 'Traditional', duration: '3:55', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    { id: 'tr-06', title: 'Lir Ilir', artist: 'Javanese Choral', category: 'Traditional', duration: '4:00', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
    { id: 'tr-07', title: 'Semar Pagulingan', artist: 'Gamelan Bali', category: 'Traditional', duration: '5:10', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
    { id: 'tr-08', title: 'Kecak Harmony', artist: 'Balinese Vocal', category: 'Traditional', duration: '4:30', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
    { id: 'tr-09', title: 'Janger Bali', artist: 'Traditional Bali', category: 'Traditional', duration: '3:40', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
    { id: 'tr-10', title: 'Ayam Den Lapeh', artist: 'Minangkabau', category: 'Traditional', duration: '3:50', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
    { id: 'tr-11', title: 'Kampuang Nan Jauh', artist: 'Minang Ballad', category: 'Traditional', duration: '4:15', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3' },
    { id: 'tr-12', title: 'Zapin Melayu', artist: 'Riau Traditional', category: 'Traditional', duration: '4:05', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3' },
    { id: 'tr-13', title: 'Mak Inang', artist: 'Melayu Deli', category: 'Traditional', duration: '3:35', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3' },
    { id: 'tr-14', title: 'Gondang Batak', artist: 'Toba Ensemble', category: 'Traditional', duration: '4:30', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3' },
    { id: 'tr-15', title: 'Butet', artist: 'Batak Romantic', category: 'Traditional', duration: '4:00', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3' },
    { id: 'tr-16', title: 'Ampar-Ampar Pisang', artist: 'Banjar Folk', category: 'Traditional', duration: '3:25', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3' },
    { id: 'tr-17', title: 'Anging Mammiri', artist: 'Makassar Strings', category: 'Traditional', duration: '3:55', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 'tr-18', title: 'Pakarena', artist: 'Bugis Sulawesi', category: 'Traditional', duration: '4:20', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 'tr-19', title: 'Apuse', artist: 'Papuan Traditional', category: 'Traditional', duration: '3:20', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: 'tr-20', title: 'Yamko Rambe Yamko', artist: 'Papua Choral', category: 'Traditional', duration: '3:45', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { id: 'tr-21', title: 'Cik Cik Periuk', artist: 'Kalimantan Folk', category: 'Traditional', duration: '3:30', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    { id: 'tr-22', title: 'Hela Rotane', artist: 'NTT Traditional', category: 'Traditional', duration: '4:10', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
    { id: 'tr-23', title: 'Ayo Mama', artist: 'Maluku Folk', category: 'Traditional', duration: '3:15', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
    { id: 'tr-24', title: 'Rasa Sayange', artist: 'Ambon Classic', category: 'Traditional', duration: '3:50', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
    { id: 'tr-25', title: 'O Ina Ni Keke', artist: 'Manado Traditional', category: 'Traditional', duration: '4:05', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },

    // ========== INSTRUMENTAL POP (5) ==========
    { id: 'pop-01', title: 'Romantic Piano No. 1', artist: 'Wedding Piano', category: 'Instrumental', duration: '4:10', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
    { id: 'pop-02', title: 'Violin Serenade', artist: 'String Ensemble', category: 'Instrumental', duration: '4:30', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3' },
    { id: 'pop-03', title: 'Acoustic Love', artist: 'Guitar Solo', category: 'Instrumental', duration: '3:45', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3' },
    { id: 'pop-04', title: 'First Dance Waltz', artist: 'Orchestral', category: 'Instrumental', duration: '4:50', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3' },
    { id: 'pop-05', title: 'Forever Yours', artist: 'Piano & Strings', category: 'Instrumental', duration: '4:20', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3' },

    // ========== MIXED ESSENTIALS (5) ==========
    { id: 'mix-01', title: 'Canon in D', artist: 'Pachelbel', category: 'Mixed', duration: '5:30', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3' },
    { id: 'mix-02', title: 'Air on the G String', artist: 'Bach', category: 'Mixed', duration: '4:45', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3' },
    { id: 'mix-03', title: 'Spring (Vivaldi)', artist: 'Four Seasons', category: 'Mixed', duration: '3:40', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 'mix-04', title: 'Golden Hour Lo-Fi', artist: 'Chill Beats', category: 'Mixed', duration: '3:50', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 'mix-05', title: 'Acoustic Morning', artist: 'Folk Acoustic', category: 'Mixed', duration: '4:00', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

const TEMP_DIR = path.join(__dirname, 'temp_music');
const API_BASE = 'https://api.tamuu.id';

// Create temp directory
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Download file helper
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Follow redirect
                https.get(response.headers.location, (res) => {
                    res.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve();
                    });
                }).on('error', reject);
            } else {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            }
        }).on('error', reject);
    });
}

async function main() {
    console.log('='.repeat(60));
    console.log('SYMPHONY BLUEPRINT MUSIC SEEDER');
    console.log(`Total tracks to process: ${TRACKS.length}`);
    console.log('='.repeat(60));

    for (let i = 0; i < TRACKS.length; i++) {
        const track = TRACKS[i];
        const filename = `${track.id}.mp3`;
        const localPath = path.join(TEMP_DIR, filename);
        const r2Key = `music/${filename}`;
        const r2Url = `${API_BASE}/assets/${r2Key}`;

        console.log(`\n[${i + 1}/${TRACKS.length}] Processing: ${track.title}`);

        try {
            // Step 1: Download
            console.log(`  ↓ Downloading from source...`);
            await downloadFile(track.source, localPath);
            console.log(`  ✓ Downloaded to ${filename}`);

            // Step 2: Upload to R2
            console.log(`  ↑ Uploading to R2...`);
            execSync(`npx wrangler r2 object put tamuu-assets/${r2Key} --file="${localPath}" --remote`, {
                stdio: 'pipe',
                cwd: __dirname
            });
            console.log(`  ✓ Uploaded to R2`);

            // Step 3: Insert to D1
            console.log(`  → Inserting to D1...`);
            const sql = `INSERT OR REPLACE INTO music_library (id, title, artist, url, category, duration, is_premium, source_type, created_at) VALUES ('${track.id}', '${track.title.replace(/'/g, "''")}', '${track.artist.replace(/'/g, "''")}', '${r2Url}', '${track.category}', '${track.duration}', 0, 'library', datetime('now'))`;
            execSync(`npx wrangler d1 execute tamuu-db --remote --command="${sql}"`, {
                stdio: 'pipe',
                cwd: __dirname
            });
            console.log(`  ✓ Inserted to D1`);

            // Cleanup local file
            fs.unlinkSync(localPath);

        } catch (error) {
            console.error(`  ✗ Error: ${error.message}`);
        }
    }

    // Cleanup temp directory
    if (fs.existsSync(TEMP_DIR)) {
        fs.rmdirSync(TEMP_DIR, { recursive: true });
    }

    console.log('\n' + '='.repeat(60));
    console.log('SEEDING COMPLETE!');
    console.log('='.repeat(60));
}

main().catch(console.error);
