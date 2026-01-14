import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mqbgpulironhtvzfpzfp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xYmdwdWxpcm9uaHR2emZwemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzcwNDksImV4cCI6MjA4MjMxMzA0OX0.wFmTRftjHuBj-vQ2gcZ_pJzVNkcJCAPbWl7fnfWUniU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function createAccounts() {
    console.log('🚀 Starting test account creation...\n');

    const accounts = [
        {
            email: 'user@tamuu.id',
            password: 'Testing123!',
            data: {
                full_name: 'Test User',
                role: 'user'
            }
        },
        {
            email: 'admin@tamuu.id',
            password: 'Admin123!',
            data: {
                full_name: 'Test Admin',
                role: 'admin'
            }
        }
    ];

    for (const account of accounts) {
        console.log(`Creating account: ${account.email}...`);
        const { data, error } = await supabase.auth.signUp({
            email: account.email,
            password: account.password,
            options: {
                data: account.data
            }
        });

        if (error) {
            if (error.message.includes('already registered')) {
                console.log(`✅ ${account.email} already exists.`);
            } else {
                console.error(`❌ Error creating ${account.email}:`, error.message);
            }
        } else {
            console.log(`✅ ${account.email} created successfully! (ID: ${data.user?.id})`);
        }

        console.log('Waiting 31 seconds to avoid rate limits...');
        await sleep(31000);
    }

    console.log('\n✨ Account creation process finished.');
}

createAccounts().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
