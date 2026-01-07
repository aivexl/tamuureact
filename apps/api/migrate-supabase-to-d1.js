/**
 * Full Supabase Data Fetcher & D1 Migration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://mqbgpulironhtvzfpzfp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xYmdwdWxpcm9uaHR2emZwemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzcwNDksImV4cCI6MjA4MjMxMzA0OX0.wFmTRftjHuBj-vQ2gcZ_pJzVNkcJCAPbWl7fnfWUniU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchAndMigrate() {
    console.log('🚀 Starting Full Migration...\n');

    // 1. Fetch ALL templates with ALL columns
    console.log('📥 Fetching templates...');
    const { data: templates, error: templatesError } = await supabase
        .from('templates')
        .select('*');

    if (templatesError) {
        console.error('❌ Templates error:', templatesError);
        return;
    }

    console.log(`✅ Found ${templates.length} templates`);
    console.log('Template columns:', Object.keys(templates[0] || {}));

    // 2. Fetch template_sections
    console.log('\n📥 Fetching sections...');
    const { data: sections, error: sectionsError } = await supabase
        .from('template_sections')
        .select('*');

    if (sectionsError) {
        console.error('❌ Sections error:', sectionsError);
    } else {
        console.log(`✅ Found ${sections.length} sections`);
        console.log('Section columns:', Object.keys(sections[0] || {}));
    }

    // 3. Fetch template_elements
    console.log('\n📥 Fetching elements...');
    const { data: elements, error: elementsError } = await supabase
        .from('template_elements')
        .select('*');

    if (elementsError) {
        console.error('❌ Elements error:', elementsError);
    } else {
        console.log(`✅ Found ${elements.length} elements`);
        console.log('Element columns:', Object.keys(elements[0] || {}));
    }

    // 4. Build D1-compatible structure
    console.log('\n🔧 Building D1 structure...');
    const d1Templates = [];

    for (const template of templates) {
        // Get sections for this template
        const templateSections = (sections || [])
            .filter(s => s.template_id === template.id)
            .map(section => {
                // Get elements for this section
                const sectionElements = (elements || [])
                    .filter(e => e.section_id === section.id)
                    .map(el => ({
                        id: el.id,
                        type: el.type,
                        name: el.name,
                        x: el.position_x || el.x || 0,
                        y: el.position_y || el.y || 0,
                        width: el.width || 100,
                        height: el.height || 100,
                        zIndex: el.z_index || el.zIndex || 0,
                        rotation: el.rotation || 0,
                        opacity: el.opacity || 1,
                        isVisible: el.is_visible !== false,
                        isLocked: el.is_locked || false,
                        animation: {
                            entrance: el.animation || el.entrance_animation || 'none',
                            loop: el.loop_animation || null,
                            delay: el.animation_delay || 0,
                            duration: el.animation_duration || 1000
                        },
                        content: el.content || '',
                        imageUrl: el.image_url || el.src || '',
                        textStyle: el.text_style || el.style || {},
                        ...el // Keep all other properties
                    }));

                return {
                    id: section.id,
                    key: section.type || section.key || 'section',
                    title: section.page_title || section.title || section.type || 'Section',
                    order: section.order || 0,
                    isVisible: section.is_visible !== false,
                    backgroundColor: section.background_color || '#0a0a0a',
                    backgroundImage: section.background_url || section.background_image || null,
                    elements: sectionElements
                };
            })
            .sort((a, b) => a.order - b.order);

        const d1Template = {
            id: template.id,
            name: template.name || 'Untitled',
            slug: template.slug || template.name?.toLowerCase().replace(/\s+/g, '-') || 'untitled',
            thumbnail: template.thumbnail || template.thumbnail_url || null,
            category: template.category || 'Wedding',
            zoom: template.zoom || 1,
            pan: JSON.stringify(template.pan || { x: 0, y: 0 }),
            sections: JSON.stringify(templateSections),
            layers: JSON.stringify(template.layers || []),
            created_at: template.created_at || new Date().toISOString(),
            updated_at: template.updated_at || new Date().toISOString()
        };

        d1Templates.push(d1Template);
        console.log(`  ✅ ${template.name}: ${templateSections.length} sections, ${templateSections.reduce((acc, s) => acc + s.elements.length, 0)} elements`);
    }

    // 5. Generate SQL
    console.log('\n📝 Generating SQL...');
    const sqlStatements = d1Templates.map(t => {
        const escapeSql = (str) => str ? str.replace(/'/g, "''") : '';
        return `INSERT INTO templates (id, name, slug, thumbnail, category, zoom, pan, sections, layers, created_at, updated_at) VALUES ('${t.id}', '${escapeSql(t.name)}', '${escapeSql(t.slug)}', ${t.thumbnail ? `'${escapeSql(t.thumbnail)}'` : 'NULL'}, '${escapeSql(t.category)}', ${t.zoom}, '${escapeSql(t.pan)}', '${escapeSql(t.sections)}', '${escapeSql(t.layers)}', '${t.created_at}', '${t.updated_at}');`;
    });

    fs.writeFileSync('migration-data.sql', sqlStatements.join('\n\n'));
    console.log('✅ SQL written to migration-data.sql');

    // Also save JSON backup
    fs.writeFileSync('migration-data.json', JSON.stringify(d1Templates, null, 2));
    console.log('✅ JSON backup written to migration-data.json');

    console.log('\n📋 To apply migration, run:');
    console.log('   npx wrangler d1 execute tamuu-db --remote --file=migration-data.sql');
}

fetchAndMigrate().catch(console.error);
