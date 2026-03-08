# Tamuu Changelog

## [0.6.34] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Critical: Zero-Gap Flow Engine & Scale Compensation (V13)
- **Elimination of "Phantom Gaps"**: Resolved the long-standing issue of empty spaces between sections on mobile by implementing a **Scale-Compensated Document Flow**. The main container now explicitly calculates its height as `totalUnscaledHeight * scaleFactor`, effectively trimming the dead space left by CSS transforms.
- **Native Document Flow (Portrait)**: Migrated all mobile portrait sections to `position: relative` within a flexbox stack. This ensures every section touches perfectly, following the browser's natural layout rules.
- **iPhone SE Early Access Scroll**: Enabled vertical scrolling for iPhone SE users immediately upon page load, bypassing the single-viewport restriction to prevent content overlap while maintaining a clean isolated cover.
- **Stable Transformation Wrapper**: Removed `overflow: hidden` from the internal scaling wrapper to guarantee 100% visibility of elements that expand vertically due to text wrapping.

## [0.6.33] - 2026-03-08
... (rest of changelog)

**Environment**: Production

### Critical: Natural Document Flow & iPhone SE Scrollable Architecture (V11)
- **Elimination of Vertical Compression**: For iPhone SE and smaller devices (width <= 385px), the system now bypasses all piecewise vertical compression. Elements maintain their original 1:1 design-space coordinates, ensuring zero overlapping even at high density.
- **Scrollable Cover Strategy**: Sections on small devices are no longer forced to fit a single viewport. Section 0 (Cover) now has a minimum height of 896px, allowing elements to overflow the 667px screen naturally.

## [0.6.31] - 2026-03-08
... (rest of changelog)
