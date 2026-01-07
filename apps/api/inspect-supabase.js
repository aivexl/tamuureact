/**
 * Supabase Schema Inspector
 * Lists all available tables and their structures
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mqbgpulironhtvzfpzfp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xYmdwdWxpcm9uaHR2emZwemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzcwNDksImV4cCI6MjA4MjMxMzA0OX0.wFmTRftjHuBj-vQ2gcZ_pJzVNkcJCAPbWl7fnfWUniU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectSchema() {
    console.log('🔍 Inspecting Supabase Schema...\n');

    // Common table names to check
    const tablesToCheck = [
        'templates',
        'template_sections',
        'template_elements',
        'invitations',
        'invitation_sections',
        'invitation_elements',
        'users',
        'rsvp_responses',
        'projects',
        'designs',
        'cards'
    ];

    for (const table of tablesToCheck) {
        const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`❌ ${table}: ${error.message}`);
        } else {
            console.log(`✅ ${table}: exists (checking rows...)`);

            // Get actual row count
            const { data: rows, error: rowError } = await supabase
                .from(table)
                .select('*')
                .limit(5);

            if (!rowError && rows) {
                console.log(`   → ${rows.length} rows (showing up to 5)`);
                if (rows.length > 0) {
                    console.log(`   → Columns: ${Object.keys(rows[0]).join(', ')}`);
                }
            }
        }
    }
}

inspectSchema().catch(console.error);
