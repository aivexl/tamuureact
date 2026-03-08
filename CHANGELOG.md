# Tamuu Changelog

## [0.6.40] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Bug Fix: Smart Tutorial Filtering & Navigation
- **Dynamic Step Filtering**: Fixed a critical bug where the tutorial would get stuck on missing UI elements (e.g., Location, Gifts). The system now automatically detects element existence in the DOM and only shows relevant tips.
- **Back Navigation**: Added a "Kembali" (Back) button to the tutorial cards, allowing users to revisit previous steps.
- **UI Refinement**: 
  - Removed the Sparkle icon from tutorial cards for a cleaner, more focused look.
  - Improved color contrast for step titles (Indigo-400).
- **Stability**: Refined auto-scroll and coordinate calculation to handle dynamic grid items more reliably.

## [0.6.39] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### UI/UX: Refined Item-by-Item Grid Tutorial
- **Granular Grid Guidance**: Refactored the tutorial to explain every single item in the feature grid one-by-one (Music, Lucky Draw, Template, Guests, Wishes, Display TV, Location, Gift, Gallery, Live Stream, Analytics, and Download).
- **Clean UI (No Backdrop)**: Removed the dark blurry overlay for a cleaner, non-intrusive learning experience.
- **Sticky Viewport-Aware Tooltips**: 
  - Tooltips now use viewport-relative positioning to stick perfectly to their target elements.
  - Implemented smart viewport constraints to prevent tutorial cards from being clipped by screen edges.
- **Enhanced Navigation**: Added progress counters (e.g., 1/14) and smoother auto-scroll transitions between steps.

## [0.6.38] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### UI/UX: Interactive User Onboarding Tutorial
- **Smart Tutorial System**: Implemented a step-by-step interactive onboarding guide for new users in the User Editor.
- **Dynamic Feature Spotlight**: High-contrast overlay with "hole-punch" (clip-path) effect to focus user attention on specific UI elements (Information Card, Feature Grid, and Template Area).
- **Indonesian Localization**: All tips and guidance written in clear, non-technical Indonesian for general accessibility.
- **Smart Logic**: 
  - Smooth auto-scroll to active elements.
  - Position-aware tooltip cards (top/bottom/left/right) based on element location.
  - One-time appearance logic using local storage per invitation.
- **Streamlined Navigation**: Added Skip, Next, and Progress indicators for a modern onboarding experience.

## [0.6.37] - 2026-03-08
... (rest of changelog)

**Environment**: Production

### UI: Grid Panel Cleanup & Navigation Streamlining
- **Streamlined Editor Grid**: Removed five redundant or rarely used items from the Icon Grid Menu to improve focus and navigation speed:
  1. **Kisah (Love Story)**
  2. **Profil (Profile Card/Photo)**
  3. **Quote (Quotes)**
  4. **Tanggal (Countdown/Event Date)**
  5. **Sosmed (Social Media/SEO)**
- **UI Focus**: These elements are now managed exclusively through the section-based edit area, reducing clutter in the primary feature menu while maintaining full editing capability.

## [0.6.36] - 2026-03-08
... (rest of changelog)

**Environment**: Production

### Critical: Absolute Date/Time Enforcement & Smart Grid Architecture (V4)
- **Zero-Bypass Format Enforcement**: Dismantled native browser date/time inputs which were hijacking UI locale. Replaced with controlled text inputs that force `DD/MM/YYYY` and **24-Hour** formats regardless of browser language settings.
- **Smart Grid Menu (Dynamic Detection)**: Refactored the Editor Grid Menu to be reative. Specialized icons (Countdown, Story, Gift, etc.) now automatically appear or disappear based on real-time detection of elements within the template, supporting both modern `elements` and legacy `layers` arrays.
- **Self-Healing User Auth Sync**: Implemented a "Silent Healing" mechanism in the API. If a user ID mismatch occurs between Supabase and D1 during wishlist/save operations, the system now automatically resolves the record via email to prevent 500 errors.
- **Payload Overload Prevention (OOM Guard)**: Injected a recursive payload scrubber that nukes massive legacy base64 strings from localStorage before transmission, preventing Cloudflare Worker memory crashes (ERR_HTTP2_PROTOCOL_ERROR).
- **Timezone Bleeding Fix**: Rewrote the date parser to use manual local time construction, ensuring "Days Remaining" calculations are pixel-perfect and not shifted by UTC offsets.

## [0.6.35] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Critical: Zero-Gap Pro Engine & Parent Height Clamping (V15)
- **Resolved "Ghost Gaps" on Mobile**: Implemented **Parent Height Clamping** on the main canvas. The container now forces its height to `Math.ceil(totalUnscaledHeight * scaleFactor)`, effectively cutting off the empty space previously left by CSS transforms on iPhone SE and other scaled devices.
- **Tight-Fit Flow Engine**: Eliminated the 896px static height minimum for all sections in portrait mode. Section heights are now calculated with pixel precision based on the lowest child element (`maxBottom + 20px`), ensuring a dense, professional document flow.
- **Natural Stacking Restoration**: Re-enabled `position: relative` and `display: flex` for all portrait sections to guarantee sections touch perfectly without manual top-coordinate math.
- **Stabilized Mobile Visibility**: Reinforced the basis height logic to ensure elements never disappear due to container height collapse.

## [0.6.34] - 2026-03-08
... (rest of changelog)

**Environment**: Production

### Refactor: Isolated Scroll Engine & Early Cover Access (V12)
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
