const fs = require('fs');
let content = fs.readFileSync('available_models.json', 'utf16le');
// Strip BOM if present
if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
}
try {
    const data = JSON.parse(content);
    data.models.forEach(m => console.log(m.name));
} catch (err) {
    console.error('Failed to parse JSON:', err.message);
    console.log('Content start (codes):', content.slice(0, 10).split('').map(c => c.charCodeAt(0)).join(','));
}
