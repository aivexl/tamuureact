# Tamuu Changelog

## [0.6.32] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Critical: Natural Document Flow & iPhone SE Scrollable Architecture (V11)
- **Elimination of Vertical Compression**: For iPhone SE and smaller devices (width <= 385px), the system now bypasses all piecewise vertical compression. Elements maintain their original 1:1 design-space coordinates, ensuring zero overlapping even at high density.
- **Scrollable Cover Strategy**: Sections on small devices are no longer forced to fit a single viewport. Section 0 (Cover) now has a minimum height of 896px, allowing elements to overflow the 667px screen naturally. Users can scroll to reveal the "Open Invitation" button, providing a vastly improved UX.
- **Precision Gap Elimination**: Unified the `position: relative` stacking logic with explicit container basis heights (`totalHeight * scaleFactor`), ensuring sections touch perfectly with zero pixel gaps while maintaining absolute visibilitas.
- **Fixed API Interface**: Corrected an enterprise-level import mismatch for `API_BASE` and `safeFetch` to ensure consistent data hydration across all environments.

## [0.6.31] - 2026-03-08
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
