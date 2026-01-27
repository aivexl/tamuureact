const fs = require('fs');
const content = fs.readFileSync('discovery_full.txt', 'utf16le');
console.log(content);
