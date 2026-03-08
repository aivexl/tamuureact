# Tamuu Changelog

## [0.6.28] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Refactor: Hardcore iPhone SE Responsiveness (SE Engine V8)
- **Zero-Compression Policy**: Disables the piecewise vertical compression algorithm exclusively for devices with width < 400px (iPhone SE, etc.). Elements now use 1:1 design-space mapping to prevent mathematical overlapping.
- **Dynamic Content Stacking**: Fully integrated `cumulativeShift` logic for small screens. If an element's real-time height exceeds its design height, all elements visually below it are pushed down automatically.
- **Gap Elimination**: Sections on small devices now have precise heights based on their lowest content element (`maxBottom + 40px`), completely removing the masif gaps between sections.
- **Device-Specific Isolation**: Implemented a `isiPhoneSE` guard to ensure that large devices (iPhone 12/13/14/15) continue to use the original stable 896px static layout, preserving their intended design fidelity.
- **Resolved Visibility Issues**: Hardened the main container basis height calculation to ensure 100% visibilitas on all mobile browsers.

## [0.6.27] - 2026-03-08
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
