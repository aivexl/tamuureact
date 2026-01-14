import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mqbgpulironhtvzfpzfp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xYmdwdWxpcm9uaHR2emZwemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzcwNDksImV4cCI6MjA4MjMxMzA0OX0.wFmTRftjHuBj-vQ2gcZ_pJzVNkcJCAPbWl7fnfWUniU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verify() {
    console.log('🔍 Verifying test accounts...\n');

    const testUsers = [
        { email: 'user@tamuu.id', password: 'Testing123!' },
        { email: 'admin@tamuu.id', password: 'Admin123!' }
    ];

    for (const testUser of testUsers) {
        process.stdout.write(`Checking ${testUser.email}... `);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: testUser.email,
            password: testUser.password
        });

        if (error) {
            if (error.message.includes('Email not confirmed')) {
                console.log('🟡 Created, but needs confirmation.');
            } else if (error.message.includes('Invalid login credentials')) {
                console.log('❌ Not found (or wrong password).');
            } else {
                console.log(`❌ Error: ${error.message}`);
            }
        } else {
            console.log(`✅ OK! Role: ${data.user.user_metadata.role}`);
            await supabase.auth.signOut();
        }
    }
}

verify().catch(console.error);
