# Tamuu Changelog

## [0.6.43] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### UI/UX: Enterprise Text Editor & Extreme Mobile Response
- **Refined Text Input**: Re-engineered the "KONTEN TEKS" editor with a significantly larger, more proportional `textarea` (min-height 120px) and a higher-contrast text style (Slate-800, Bold) for better readability.
- **Enterprise Styling Grid**: Refactored text styling controls (Fonts, Alignment, Metrics) into a clean, responsive grid that adapts perfectly between mobile and desktop viewports.
- **Extreme Mobile Responsiveness**: 
  - Reduced section padding from `p-10` to `p-2` on mobile to maximize workspace.
  - Implemented auto-scaling for Konva previews to prevent horizontal overflow on small devices like iPhone SE.
  - Slimmed down the section drag-handle strip for more content real-estate.
- **Tutorial V7 (Robust Discovery)**:
  - Added a "Welcome" step that appears instantly without DOM dependencies.
  - Implemented a persistent 20-second discovery cycle to ensure tutorial tips "snap" to dynamic elements as they render.
  - Lifted the tutorial overlay to `z-index: 1000000` via Portal for zero clipping.

## [0.6.42] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### UI/UX: Tutorial System Enterprise V2 (Reactive Paint Fix)
- **Reactive DOM Scanning**: Resolved the race condition where tutorial cards wouldn't appear because DOM elements weren't fully painted. Added a smart 800ms buffer and reactive step filtering.
- **Enterprise Card Layout**: Implemented a proportional `flex-col` layout for tutorial tooltips, ensuring zero overlap between title, description, and navigation buttons.
- **Mobile-First Fixed Positioning**: Migrated from absolute to fixed positioning for the tutorial layer to guarantee pixel-perfect alignment across all device heights and scroll states.
- **Scale-In Micro-interactions**: Replaced top-down slide animations with high-end scale and fade transitions (200ms) for a direct, responsive feel.
- **Enhanced Reliability**: Implemented `availableSteps` auto-validation to dynamically bypass inactive feature buttons, ensuring the tutorial never gets "stuck" on hidden UI elements.

## [0.6.41] - 2026-03-08
... (rest of changelog)
