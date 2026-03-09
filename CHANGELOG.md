# Tamuu Changelog

## [0.6.46] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### UI/UX: Enterprise Tutorial V9 (Real-time Motion Sync)
- **Live rAF Motion Engine**: Implemented a `RequestAnimationFrame` loop for the tutorial overlay. The cards now fluidly "stick" to target elements even during smooth scrolling and staggered animations.
- **Auto-Flipping Visibility**: Tooltip cards now intelligently calculate viewport collisions and auto-adjust their position to prevent clipping at screen edges.
- **Dynamic Portal Architecture**: Tutorial content is now projected directly into `document.body` via Portals, bypassing all parent container layout constraints and Z-index isolation.
- **Target-Aware Pointer**: The pointing arrow now dynamically repositions itself along the card's edge to stay perfectly aligned with the target element's center.
- **Safe-Area Awareness**: Integrated mobile safe-area insets to ensure buttons are reachable and cards are visible on notched devices.

## [0.6.45] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### UI/UX: Enterprise Tutorial V8 & Extreme Responsiveness
- **Robust Tutorial Launch**: Implemented a "Welcome" step fallback that doesn't depend on the DOM, ensuring the tutorial card appears 100% of the time upon page load.
- **Extended Guidance**: Added new tutorial steps for Publish/Draft, Tabs, and Save buttons.
- **Mobile First Layout Refinement**: Re-engineered Text Editor and slimmed drag-handles.

## [0.6.44] - 2026-03-08
... (rest of changelog)
