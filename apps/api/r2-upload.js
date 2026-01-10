
const { execSync } = require('child_process');

const files = [
    // Traditional
    'music/tr-sabilulungan.mp3', 'music/tr-kayumanis.mp3', 'music/tr-bali.mp3', 'music/tr-minang.mp3', 'music/tr-zapin.mp3',
    'music/tr-batak.mp3', 'music/tr-makassar.mp3', 'music/tr-papua.mp3', 'music/tr-bubuy.mp3', 'music/tr-manuk.mp3',
    // Pop
    'music/pop-biw.mp3', 'music/pop-aty.mp3', 'music/pop-perfect.mp3', 'music/pop-chfil.mp3', 'music/pop-eid.mp3',
    'music/pop-hallelujah.mp3', 'music/pop-marryme.mp3', 'music/pop-allofme.mp3', 'music/pop-wildest.mp3', 'music/pop-rewrite.mp3',
    // Acoustic
    'music/ac-morning.mp3', 'music/ac-lazy.mp3', 'music/ac-beach.mp3', 'music/ac-forest.mp3', 'music/ac-rain.mp3',
    'music/ac-sunset.mp3', 'music/ac-mountain.mp3', 'music/ac-river.mp3', 'music/ac-starry.mp3', 'music/ac-meadow.mp3',
    // Classic
    'music/classic-canon.mp3', 'music/classic-bach-air.mp3', 'music/classic-clair.mp3', 'music/classic-moonlight.mp3', 'music/classic-ave-maria.mp3',
    'music/classic-vivaldi-spring.mp3', 'music/classic-swan.mp3', 'music/classic-minuet.mp3', 'music/classic-nessun.mp3', 'music/classic-wedding-march.mp3',
    // Modern
    'music/mod-lofi.mp3', 'music/mod-house.mp3', 'music/mod-neon.mp3', 'music/mod-party.mp3', 'music/mod-focus.mp3',
    'music/mod-urban.mp3', 'music/mod-chill.mp3', 'music/mod-soul.mp3', 'music/mod-sky.mp3', 'music/mod-cyber.mp3'
];

console.log(`Starting upload of ${files.length} mock files to R2...`);

files.forEach((file, index) => {
    try {
        console.log(`[${index + 1}/${files.length}] Uploading ${file}...`);
        // Using "temp_music.mp3" as source for all
        execSync(`npx wrangler r2 object put tamuu-assets/${file} --file=../../temp_music.mp3 --remote`, { stdio: 'inherit' });
    } catch (e) {
        console.error(`Failed to upload ${file}:`, e.message);
    }
});

console.log('R2 Upload Complete!');
