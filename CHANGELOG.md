# Tamuu Changelog

## [0.6.25] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Critical: Unified Flow Engine V4 & Design-Space Precision
- **Implementation of Unified Flow Engine V4**: Completely migrated the mobile preview layout from absolute-based positioning to a hybrid relative-flow architecture. By using `position: relative` and `display: flex` on mobile, the system now eliminates "Phantom Gaps" and guarantees 100% section-to-section continuity.
- **Normalized Design-Space Measurement**: Upgraded `ElementRenderer` to use `scrollWidth/scrollHeight` instead of `getBoundingClientRect`. This ensures that element dimensions are reported in their raw "Design Space" units, unaffected by mobile browser scaling, resulting in perfectly accurate stacking shifts.
- **Dynamic Adaptive Section 0**: Transformed the cover section into an elastic container. It now automatically expands vertically if content wraps on narrow screens (e.g., iPhone SE), preventing the "Open Invitation" button from colliding with text.
- **Double-Shift Protection**: Explicitly disabled element anchoring during mobile flow-mode to prevent layout jitter and coordinate jumping caused by redundant positioning engines.

## [0.6.24] - 2026-03-08
**Status**: 🟢 Deployed
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
