/**
 * TESTTEMPLATE ASSET URL UPDATER
 * Updates Supabase URLs to R2 URLs directly in D1 database
 */

// URL Mapping - Supabase to R2
const urlMapping = {
    'https://mqbgpulironhtvzfpzfp.supabase.co/storage/v1/object/public/invitation-assets/anon/1766801467213_3164.png': 'https://api.tamuu.id/assets/uploads/1766801467213_3164.png',
    'https://mqbgpulironhtvzfpzfp.supabase.co/storage/v1/object/public/invitation-assets/anon/1766815585358_9185.png': 'https://api.tamuu.id/assets/uploads/1766815585358_9185.png',
    'https://mqbgpulironhtvzfpzfp.supabase.co/storage/v1/object/public/invitation-assets/anon/1766817790628_7573.png': 'https://api.tamuu.id/assets/uploads/1766817790628_7573.png',
    'https://mqbgpulironhtvzfpzfp.supabase.co/storage/v1/object/public/invitation-assets/anon/1767021194998_2984.png': 'https://api.tamuu.id/assets/uploads/1767021194998_2984.png',
    'https://mqbgpulironhtvzfpzfp.supabase.co/storage/v1/object/public/invitation-assets/anon/1767022386553_5822.png': 'https://api.tamuu.id/assets/uploads/1767022386553_5822.png',
    'https://mqbgpulironhtvzfpzfp.supabase.co/storage/v1/object/public/invitation-assets/anon/1767183712278_2145.png': 'https://api.tamuu.id/assets/uploads/1767183712278_2145.png'
};

function replaceUrls(jsonString) {
    let result = jsonString;
    for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
        result = result.split(oldUrl).join(newUrl);
    }
    return result;
}

// Generate SQL UPDATE statements
async function generateUpdateSQL() {
    const fs = require('fs');

    // Read the original UTF8 data
    const rawData = fs.readFileSync('testtemplate_full_utf8.txt', 'utf8');

    // Parse the JSON to extract sections and orbit data
    const parsed = JSON.parse(rawData);
    const results = parsed[0]?.results?.[0];

    if (!results) {
        console.error('No template data found');
        return;
    }

    // Replace URLs in sections
    let sectionsUpdated = replaceUrls(results.sections);
    let orbitUpdated = replaceUrls(results.orbit);

    // Create SQL-safe strings (escape single quotes)
    sectionsUpdated = sectionsUpdated.replace(/'/g, "''");
    orbitUpdated = orbitUpdated.replace(/'/g, "''");

    // Generate SQL
    const sql = `UPDATE templates SET 
        sections = '${sectionsUpdated}',
        orbit = '${orbitUpdated}',
        updated_at = datetime('now')
    WHERE slug = 'testtemplate';`;

    fs.writeFileSync('update_testtemplate_urls.sql', sql);
    console.log('✅ Generated update_testtemplate_urls.sql');
    console.log('Run: npx wrangler d1 execute tamuu-db --remote --file=update_testtemplate_urls.sql');
}

generateUpdateSQL();
