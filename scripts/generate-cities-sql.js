const fs = require('fs');
const path = require('path');

const regionsPath = path.join(__dirname, '../apps/main/src/constants/regions.ts');
const outPath = path.join(__dirname, '../apps/api/migrations/0050_seed_all_cities.sql');

const content = fs.readFileSync(regionsPath, 'utf-8');
const match = content.match(/export const INDONESIA_REGIONS = \[\s*([\s\S]*?)\s*\]/);

if (!match) {
    console.error('Gagal menemukan data INDONESIA_REGIONS.');
    process.exit(1);
}

const rawItems = match[1]
    .split(',')
    .map(s => s.trim().replace(/^"|^'|"$|'$/g, ''))
    .filter(s => s && !s.includes('].sort'));

const uniqueCities = Array.from(new Set(
    rawItems.map(r => r.replace(/^(Kab\.|Kota)\s+/i, ''))
)).sort();

let sql = `-- Migration: 0050_seed_all_cities.sql\n`;
sql += `-- Description: Insert seluruh 500+ Kota/Kabupaten ke SEO Metadata\n\n`;
sql += `INSERT OR REPLACE INTO seo_city_metadata (city_name, province, local_fact) VALUES\n`;

const values = uniqueCities.map(city => 
    `('${city.replace(/'/g, "''")}', 'Indonesia', 'Pusat vendor pernikahan dan acara terbaik di wilayah ${city.replace(/'/g, "''")}')`
);

sql += values.join(',\n') + ';\n';

fs.writeFileSync(outPath, sql);
console.log(`Berhasil membuat file SQL dengan ${uniqueCities.length} kota di:\n${outPath}`);