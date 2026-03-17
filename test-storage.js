const fs = require('fs');
const content = fs.readFileSync('apps/web/src/lib/api.ts', 'utf8');
const lines = content.split('\n');
const startIndex = lines.findIndex(l => l.includes('export const storage = {'));
const endIndex = lines.findIndex((l, i) => i > startIndex && l.startsWith('};'));
console.log(lines.slice(startIndex, endIndex + 1).join('\n'));
