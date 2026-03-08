# Tamuu Changelog

## [0.6.27] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Refactor: Targeted iPhone SE Responsiveness (Fluid-Stack Engine V7)
- **Implementation of Fluid-Stack Architecture**: Introduced a device-specific layout engine that activates only for screens with width <= 380px. This prevents the "Compression Overload" issue by allowing sections to grow vertically instead of forcing them into a static viewport height.
- **iPhone SE Exclusive Stacking**: Replaced piecewise vertical compression with a 1:1 design-space mapping and cumulative pergeseran. This mathematically guarantees zero overlapping on small screens where text wrapping might occur.
- **Elastic Section Heights**: Removed the 896px static height requirement for portrait mode on small devices. Sections now automatically expand to fit their content (`maxBottom + 100px`), eliminating gaps and ensuring all elements are visible.
- **Restored Large-Device Parity**: Guaranteed that devices larger than 380px (iPhone 12/13/14/15, etc.) continue to use the original stable layout logic, maintaining design consistency and the original position of the "Open Invitation" button.
- **Stability Fix**: Resolved height collapse issues on mobile by ensuring the main canvas container always has an explicit basis height calculated from the total dynamic height of all sections.

## [0.6.25] - 2026-03-08
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
