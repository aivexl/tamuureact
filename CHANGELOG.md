# Tamuu Changelog

## [0.6.31] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Critical: Atomic Relative Flow & Zero-Gap Mobile Layout (V10)
- **Elimination of "Phantom Gaps"**: Re-engineered the mobile preview to use `position: relative` stacking within a `display: flex` container. This completely removes gaps between sections by following the browser's native document flow.
- **Restored Mobile Visibilitas**: Fixed the "Blank Screen" issue by enforcing explicit basis heights (`totalHeight * scaleFactor`) on the primary canvas, preventing container collapse during flow-mode.
- **iPhone SE Elastic Engine**: Refined the stacking engine for small devices (width < 400px) to use 1:1 design-space mapping. This prevents overlapping by allowing sections to grow vertically instead of being compressed.
- **Piecewise Mapping Restoration**: Returned to stable piecewise mapping for standard mobile devices to maintain design consistency for buttons and title anchors.

## [0.6.30] - 2026-03-08
... (rest of changelog)

**Environment**: Production

### Refactor: Mobile UI/UX Standard & Breathability
- **Standardized Padding**: Added 60px breathing room to the bottom of all mobile sections to prevent elements from feeling cramped.
- **Touch Target Optimization**: Calibrated interactive element zones to meet the 44px enterprise touch target standard for iPhone SE users.

## [0.6.23] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Refactor: iPhone SE Responsiveness & Liquid Stacking Engine
- **Implementation of Liquid Stacking Engine**: Overhauled the `PreviewView` layout logic to support dynamic vertical stacking. Elements now calculate a cumulative `stackShift` based on the real-time growth of all elements visually above them. This mathematically guarantees zero overlapping on narrow screens (375px) where text frequently wraps.
- **iPhone SE Specific Calibration**: Refined the Section 0 piecewise mapping algorithm for screens with height < 700px. The new logic safely absorbs dynamic pergeseran within defined top/bottom buffer zones, preventing layout "crushing" on short devices.
- **Order-Aware Layout Intelligence**: Elements are now sorted by their design-time Y-coordinates before calculating pergeseran, ensuring that the physical relationship between design elements is preserved regardless of content expansion.

## [0.6.22] - 2026-03-07
**Status**: 🟢 Deployed
**Environment**: Production

### Critical: Hybrid Smart-Fit Layout & Mobile Responsiveness
- **Fix: Mobile Section Clipping**: Inital "Hybrid Smart-Fit" engine implementation. Sections automatically expand height based on content.
- **Fix: Perfect 1:1 Text Spacing**: Eliminated vertical text compression for Section 1+.
- **DOM-Measured Narrative Integrity**: Integrated `ResizeObserver` into `LoveStoryElement` and `RSVPWishesElement`.

## [0.6.5] - 2026-03-07
**Status**: 🟢 Deployed
**Environment**: Production

### Fix: Photo Grid UI Stability & High-Performance Editor Save
... (rest of changelog)
