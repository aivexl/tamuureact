const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Config
const SUPABASE_BASE = 'https://mqbgpulironhtvzfpzfp.supabase.co';
const R2_BASE = 'https://api.tamuu.id/assets/uploads';
const ASSETS_DIR = path.join(__dirname, 'temp_assets');

if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR);

async function migrate() {
    console.log('🚀 Starting Migration...');

    // Read testtemplate data
    const rawData = fs.readFileSync('testtemplate_full_utf8.txt', 'utf8');

    // Extract URLs menggunakan regex
    // Supabase URLs usually look like: https://mqbgpulironhtvzfpzfp.supabase.co/storage/v1/object/public/invitation-assets/...
    const urlRegex = /https:\/\/mqbgpulironhtvzfpzfp\.supabase\.co\/storage\/v1\/object\/public\/[^\s\"\'\}]+/g;
    const matches = rawData.match(urlRegex) || [];
    const uniqueUrls = [...new Set(matches)];

    console.log(`Found ${uniqueUrls.length} unique Supabase assets`);

    const urlMap = {};

    for (const oldUrl of uniqueUrls) {
        try {
            const filename = oldUrl.split('/').pop().split('?')[0];
            const localPath = path.join(ASSETS_DIR, filename);

            console.log(`\n📦 Migrating: ${filename}`);

            // 1. Download dari Supabase
            // Kita pakai curl karena di env ini mungkin tidak ada fetch global yang stabil di script sederhana
            execSync(`curl -L -o "${localPath}" "${oldUrl}"`);

            // 2. Upload ke Cloudflare R2 via Wrangler
            // Wrangler put command: wrangler r2 object put bucket/key --file source
            const r2Key = `uploads/${filename}`;
            console.log(`   Uploading to R2: ${r2Key}...`);
            execSync(`npx wrangler r2 object put tamuu-assets/${r2Key} --file "${localPath}"`);

            // 3. Store in Map
            urlMap[oldUrl] = `${R2_BASE}/${filename}`;
            console.log(`   ✅ Success`);
        } catch (error) {
            console.error(`   ❌ Failed to migrate ${oldUrl}:`, error.message);
        }
    }

    // 4. Update the source file with new URLs
    let updatedData = rawData;
    for (const [oldUrl, newUrl] of Object.entries(urlMap)) {
        updatedData = updatedData.split(oldUrl).join(newUrl);
    }

    // Save the updated JSON for D1 update
    fs.writeFileSync('testtemplate_migrated.json', updatedData);
    console.log('\n✨ Migration complete! "testtemplate_migrated.json" generated.');
    console.log('Now apply the D1 update manually or via another script.');
}

migrate();
