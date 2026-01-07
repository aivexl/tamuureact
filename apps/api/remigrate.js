/**
 * Final Re-migration Script - Includes Orbit Data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://mqbgpulironhtvzfpzfp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xYmdwdWxpcm9uaHR2emZwemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzcwNDksImV4cCI6MjA4MjMxMzA0OX0.wFmTRftjHuBj-vQ2gcZ_pJzVNkcJCAPbWl7fnfWUniU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function reMigrate() {
    console.log('🔄 Final Re-migration with Orbit Data...\n');

    const { data: templates, error } = await supabase
        .from('templates')
        .select('*');

    if (error) {
        console.error('❌ Error:', error);
        return;
    }

    console.log(`Found ${templates.length} templates`);

    const sqlStatements = ['-- Delete existing templates first', 'DELETE FROM templates;', ''];

    for (const t of templates) {
        console.log(`\n📄 ${t.name}`);

        // Log orbit data
        const orbit = t.orbit || {};
        const hasOrbit = orbit.left || orbit.right;
        console.log(`   Orbit: ${hasOrbit ? 'YES' : 'NO'}`);
        if (orbit.left?.elements) console.log(`   → Left elements: ${orbit.left.elements.length}`);
        if (orbit.right?.elements) console.log(`   → Right elements: ${orbit.right.elements.length}`);

        // Prepare SQL escape function
        const escape = (str) => {
            if (str === null || str === undefined) return 'NULL';
            if (typeof str === 'object') str = JSON.stringify(str);
            return `'${String(str).replace(/'/g, "''")}'`;
        };

        const sql = `INSERT INTO templates (id, name, slug, thumbnail, category, zoom, pan, sections, layers, orbit, created_at, updated_at) VALUES (${escape(t.id)}, ${escape(t.name)}, ${escape(t.slug)}, ${escape(t.thumbnail)}, ${escape(t.category || 'Wedding')}, ${t.zoom || 1}, ${escape(t.pan)}, ${escape(t.sections)}, ${escape(t.layers || [])}, ${escape(t.orbit || {})}, ${escape(t.created_at)}, ${escape(t.updated_at)});`;

        sqlStatements.push(sql);
    }

    const outputFile = 'remigration-final.sql';
    fs.writeFileSync(outputFile, sqlStatements.join('\n'));
    console.log(`\n✅ SQL written to ${outputFile}`);
    console.log('\nRun: npx wrangler d1 execute tamuu-db --remote --file=remigration-final.sql');
}

reMigrate().catch(console.error);
