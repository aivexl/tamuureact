# Tamuu Changelog

## [0.6.33] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Critical: Isolated Scroll Engine & Early Cover Access (V12)
- **Unlocked Early Scrolling (iPhone SE Exclusive)**: Enabled vertical scrolling for iPhone SE and smaller devices (width <= 385px) immediately upon initial load. Users can now scroll through long cover content before clicking the "Open Invitation" button.
- **Strict Section Isolation**: Implemented a physical DOM gate that prevents rendering of internal sections (Section 1+) until the invitation is explicitly opened. This ensures zero content "leaking" or visual clutter during the cover phase.
- **Natural Stacking for Small Viewports**: Migrated Section 0 to a relative-flow model exclusively for iPhone SE, maintaining original 1:1 design coordinates to guarantee zero element overlapping on short screens.
- **Stability Lockdown**: Reinforced the `overflow-hidden` and fixed-height constraints for larger devices (iPhone 12/13/14+), preserving the intended premium "1 screen, 1 section" aesthetic for standard mobile viewports.

## [0.6.32] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Critical: Natural Document Flow & iPhone SE Scrollable Architecture (V11)
- **Elimination of Vertical Compression**: For iPhone SE and smaller devices (width <= 385px), the system now bypasses all piecewise vertical compression. Elements maintain their original 1:1 design-space coordinates, ensuring zero overlapping even at high density.
- **Scrollable Cover Strategy**: Sections on small devices are no longer forced to fit a single viewport. Section 0 (Cover) now has a minimum height of 896px, allowing elements to overflow the 667px screen naturally.

## [0.6.31] - 2026-03-08
... (rest of changelog)
