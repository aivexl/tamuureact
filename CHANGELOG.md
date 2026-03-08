# Tamuu Changelog

## [0.6.29] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Critical: Total Gap Elimination & Mobile Document Flow (V9)
- **Elimination of Section Gaps**: Re-engineered the mobile layout to use `position: relative` stacking for sections in portrait mode. This utilizes the browser's native document flow to ensure sections touch perfectly with zero pixel gaps, regardless of device scaling or viewport size.
- **Tight-Fit Height Strategy**: Removed the 896px static height minimum for all portrait devices. Section heights are now calculated dynamically based on their lowest child element (`maxBottom + 20px`), resulting in a compact, professional look without massive empty spaces.
- **Restored Design Stability**: Returned to the robust piecewise mapping algorithm for Section 0 on standard mobile devices, ensuring the "Open Invitation" button and cover titles appear in their intended design positions.
- **iPhone SE Protection**: Maintained the localized stacking engine for devices with width <= 380px, protecting them from overlapping while they benefit from the new gapless flow architecture.

## [0.6.28] - 2026-03-08
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
