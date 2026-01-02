
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env from parents
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking for slug "testtemplate"...');
    const { data: slugData, error: slugError } = await supabase
        .from('invitations')
        .select('id, name, slug, updated_at')
        .eq('slug', 'testtemplate');

    if (slugError) console.error('Slug Error:', slugError);
    else console.log('Records with slug "testtemplate":', slugData);

    console.log('\nChecking ID "1a5b64f5-fcd3-4824-8c87-5eaa49e853e6"...');
    const { data: idData, error: idError } = await supabase
        .from('invitations')
        .select('id, name, slug, updated_at')
        .eq('id', '1a5b64f5-fcd3-4824-8c87-5eaa49e853e6');

    if (idError) console.error('ID Error:', idError);
    else console.log('Record with ID 1a5b64f5...:', idData);
}

check();
