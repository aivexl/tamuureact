# Tamuu Changelog

## [0.6.32] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Critical: Natural Document Flow & iPhone SE Scrollable Architecture (V11)
- **Elimination of Vertical Compression**: For iPhone SE and smaller devices (width <= 385px), the system now bypasses all piecewise vertical compression. Elements maintain their original 1:1 design-space coordinates, ensuring zero overlapping even at high density.
- **Scrollable Cover Strategy**: Sections on small devices are no longer forced to fit a single viewport. Section 0 (Cover) now has a minimum height of 896px, allowing elements to overflow the 667px screen naturally. Users can scroll to reveal the "Open Invitation" button, memberikan pengalaman yang jauh lebih baik.
- **Precision Gap Elimination**: Unified the `position: relative` stacking logic with explicit container basis heights (`totalHeight * scaleFactor`), memastikan section menempel sempurna dengan celah nol piksel sambil tetap menjaga visibilitas absolut.
- **Fixed API Interface**: Memperbaiki kesalahan impor tingkat enterprise untuk `API_BASE` dan `safeFetch` guna memastikan hidrasi data yang konsisten di semua lingkungan.

## [0.6.31] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Critical: Atomic Relative Flow & Zero-Gap Mobile Layout (V10)
- **Elimination of "Phantom Gaps"**: Re-engineered the mobile preview to use `position: relative` stacking within a `display: flex` container.
- **Restored Mobile Visibilitas**: Fixed the "Blank Screen" issue by enforcing explicit basis heights.

## [0.6.30] - 2026-03-08
... (rest of changelog)
