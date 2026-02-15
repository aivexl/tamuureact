const { execSync } = require('child_process');

try {
    console.log('Resetting and applying local migrations...');
    // We assume the .wrangler directory is already cleaned up before this runs, or we don't care.
    // Actually, for a fresh start, we rely on the previous step cleaning it.
    // This script just runs the apply command with 'y' input.
    execSync('npx wrangler d1 migrations apply tamuu-db --local', {
        input: 'y\n',
        encoding: 'utf-8',
        stdio: ['pipe', 'inherit', 'inherit']
    });
    console.log('Migrations applied successfully.');
} catch (error) {
    console.error('Migration failed.');
    process.exit(1);
}
