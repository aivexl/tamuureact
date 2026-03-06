const fs = require('fs');

const date = new Date();
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0');
const day = String(date.getDate()).padStart(2, '0');
const todayStr = `${year}-${month}-${day}`;

const changelogPath = 'CHANGELOG.md';
let changelog = fs.readFileSync(changelogPath, 'utf8');

const newEntry = `## [0.5.3] - ${todayStr}
**Status**: 🟢 Deployed
**Environment**: Production

### Enterprise RSVP UI/UX Redesign
- **Total Architectural Overhaul**: Redesigned all 20 RSVP form variants (Classic, Modern, Brutalist, etc.) to meet Apple-tier, Fortune 500 enterprise standards.
- **Ultra-High Definition Typography**: Implemented strict \`opacity-100\` overrides, solid color interpolation for placeholders (removing alpha channels), and \`WebkitFontSmoothing: antialiased\` to ensure razor-sharp text rendering across all DPIs without sub-pixel gradient artifacts.
- **Isolated Component Scrolling**: Re-engineered the root bounding box of the RSVP component to be strictly non-scrollable (\`overflow-hidden\`), locking the input form in place.
- **Dynamic Wishes Container**: The "Ucapan & Doa" (Wishes) section was refactored into a \`flex-1\` container with a \`min-h-[300px]\` internal scrolling zone, ensuring at least 3 cards are always visible while naturally stacking additional entries.

`;

changelog = changelog.replace('# Tamuu Changelog\n\n', '# Tamuu Changelog\n\n' + newEntry);
fs.writeFileSync(changelogPath, changelog);
