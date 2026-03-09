# Tamuu Changelog

## [0.6.44] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### UI/UX: Text Editor Polish & Clean Up
- **Refined Input Typography**: Reverted the font size inside the text editor `textarea` to a standard readable size (`text-sm`) based on user feedback, maintaining a professional and non-intrusive look.
- **UI Simplification**: Removed the helper footer text from the text editor to reduce visual clutter and provide a more focused editing experience.

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
... (rest of changelog)
