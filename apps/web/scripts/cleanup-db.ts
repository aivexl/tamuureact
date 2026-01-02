// Database cleanup script - Delete all entries except testtemplate
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Read from .env file - the project uses VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'OK' : 'MISSING');
    console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'OK' : 'MISSING');
    console.log('VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY:', process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ? 'OK' : 'MISSING');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
    console.log('=== SUPABASE DATABASE CLEANUP ===\n');
    console.log('Supabase URL:', supabaseUrl?.substring(0, 30) + '...');

    // 1. List current templates
    console.log('\n1. Listing TEMPLATES table:');
    const { data: templates, error: templatesErr } = await supabase
        .from('templates')
        .select('id, name, slug');

    if (templatesErr) {
        console.error('Error fetching templates:', templatesErr.message);
    } else {
        templates?.forEach(t => console.log(`   - ${t.slug || t.id}: ${t.name}`));
        console.log(`   Total: ${templates?.length || 0}`);
    }

    // 2. List current invitations
    console.log('\n2. Listing INVITATIONS table:');
    const { data: invitations, error: invitationsErr } = await supabase
        .from('invitations')
        .select('id, name, slug');

    if (invitationsErr) {
        console.error('Error fetching invitations:', invitationsErr.message);
    } else {
        invitations?.forEach(i => console.log(`   - ${i.slug || i.id}: ${i.name}`));
        console.log(`   Total: ${invitations?.length || 0}`);
    }

    // 3. Delete from invitations (except testtemplate)
    console.log('\n3. Deleting from INVITATIONS (except testtemplate)...');
    const { error: delInvErr } = await supabase
        .from('invitations')
        .delete()
        .neq('slug', 'testtemplate');

    if (delInvErr) {
        console.error('Error deleting invitations:', delInvErr.message);
    } else {
        console.log('   ✅ Deleted entries from invitations');
    }

    // 4. Delete from templates (except testtemplate)
    console.log('\n4. Deleting from TEMPLATES (except testtemplate)...');
    const { error: delTplErr } = await supabase
        .from('templates')
        .delete()
        .neq('slug', 'testtemplate');

    if (delTplErr) {
        console.error('Error deleting templates:', delTplErr.message);
    } else {
        console.log('   ✅ Deleted entries from templates');
    }

    // 5. Verify remaining data
    console.log('\n5. Verifying remaining data:');

    const { data: remainingTemplates } = await supabase
        .from('templates')
        .select('id, name, slug');
    console.log('   TEMPLATES:', remainingTemplates?.map(t => `${t.slug} (${t.name})`));

    const { data: remainingInvitations } = await supabase
        .from('invitations')
        .select('id, name, slug');
    console.log('   INVITATIONS:', remainingInvitations?.map(i => `${i.slug} (${i.name})`));

    console.log('\n=== CLEANUP COMPLETE ===');
}

cleanup().catch(console.error);
