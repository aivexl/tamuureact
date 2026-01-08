const fs = require('fs');
const { execSync } = require('child_process');

const FILE_PATH = 'testtemplate_migrated.json';

try {
    const rawContent = fs.readFileSync(FILE_PATH, 'utf8');

    // Find where the JSON array starts [
    const jsonStart = rawContent.indexOf('[');
    const jsonContent = rawContent.substring(jsonStart);

    const data = JSON.parse(jsonContent);
    const template = data[0].results[0];

    console.log('✅ Extracted template data for:', template.name);

    // Prepare SQL Update
    // We need to escape single quotes in JSON strings
    const escape = (str) => str.replace(/'/g, "''");

    const sql = `UPDATE templates SET 
        thumbnail = '${escape(template.thumbnail)}',
        sections = '${escape(template.sections)}',
        layers = '${escape(template.layers)}',
        orbit = '${escape(template.orbit)}'
    WHERE slug = 'testtemplate';`;

    fs.writeFileSync('update_testtemplate.sql', sql);
    console.log('✅ Generated update_testtemplate.sql');

    // Execute in D1
    console.log('🚀 Executing D1 update...');
    execSync('npx wrangler d1 execute tamuu-db --file update_testtemplate.sql --remote');
    console.log('✨ Database updated successfully!');

} catch (error) {
    console.error('❌ Error applying migration:', error.message);
}
