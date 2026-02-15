const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const DB_NAME = 'tamuu-db';

const migrations = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

console.log(`Found ${migrations.length} migrations to check.`);

for (const migration of migrations) {
    console.log(`\nReviewing migration: ${migration}...`);
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, migration), 'utf8');

    // Split into statements, handling comments and empty lines
    const statements = content.split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
        try {
            // Use temporary file for the statement to avoid shell escaping hell
            const tempFile = path.join(__dirname, 'temp_stmt.sql');
            fs.writeFileSync(tempFile, stmt + ';');

            execSync(`npx wrangler d1 execute ${DB_NAME} --local --config wrangler.toml --persist-to=.wrangler/state/v3 --file="${tempFile}"`, {
                stdio: ['ignore', 'ignore', 'pipe'], // Capture stderr
                encoding: 'utf8',
                shell: true
            });
            console.log(`  [OK] Statement applied.`);
        } catch (error) {
            const stderr = error.stderr || '';
            if (stderr.includes('duplicate column name') ||
                stderr.includes('already exists') ||
                stderr.includes('duplicate column name')) {
                console.log(`  [SKIP] Redundant: ${stderr.split('\n')[0]}`);
            } else if (stderr.includes('no such column')) {
                console.log(`  [WARN] Potential dependency issue: ${stderr.split('\n')[0]}`);
            } else {
                console.error(`  [ERROR] Critical error in statement:`);
                console.error(`  Statement: ${stmt.substring(0, 100)}...`);
                console.error(`  Error: ${stderr}`);
                // Don't exit, try to continue with other statements
            }
        }
    }
}

console.log('\nRobust migration process completed.');
