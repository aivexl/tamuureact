# Tamuu Changelog

## [0.6.42] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### UI/UX: Tutorial System Enterprise V2 (Reactive Paint Fix)
- **Reactive DOM Scanning**: Resolved the race condition where tutorial cards wouldn't appear because DOM elements weren't fully painted. Added a smart 800ms buffer and reactive step filtering.
- **Enterprise Card Layout**: Implemented a proportional `flex-col` layout for tutorial tooltips, ensuring zero overlap between title, description, and navigation buttons.
- **Mobile-First Fixed Positioning**: Migrated from absolute to fixed positioning for the tutorial layer to guarantee pixel-perfect alignment across all device heights and scroll states.
- **Scale-In Micro-interactions**: Replaced top-down slide animations with high-end scale and fade transitions (200ms) for a direct, responsive feel.
- **Enhanced Reliability**: Implemented `availableSteps` auto-validation to dynamically bypass inactive feature buttons, ensuring the tutorial never gets "stuck" on hidden UI elements.

## [0.6.41] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### UI/UX: Mobile-First Tutorial Refinement
- **Direct Positioning**: Tutorial cards now appear directly at their target coordinates using scale and opacity transitions, eliminating the "fly-in" animation from the top.
- **Dynamic Content Balancing**: Refactored card layout using a flexible flex-col design to ensure titles, descriptions, and buttons are proportionally spaced without overlapping.
- **Mobile Responsive Logic**: Card width now automatically adapts to smaller viewports (`Math.min(window.innerWidth - 40, 280)`), ensuring accessibility on all devices.
- **Zero-Stuck Intelligence**: Re-implemented `availableSteps` calculation to strictly include only elements currently rendered in the DOM, preventing tutorial stalls on missing features.
- **Enterprise UI Refinement**: 
  - Cleaned up the card header by removing the Sparkle icon.
  - Added a "Kembali" (Back) button for better user control.
  - Fixed viewport constraints logic to use `getBoundingClientRect` relative to the fixed overlay.

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
**Status**: 🟢 Deployed
**Environment**: Production

### UI: Grid Panel Cleanup & Navigation Streamlining
- **Streamlined Editor Grid**: Removed five redundant or rarely used items from the Icon Grid Menu to improve focus and navigation speed:
  1. **Kisah (Love Story)**
  2. **Profil (Profile Card/Photo)**
  3. **Quote (Quotes)**
  4. **Tanggal (Countdown/Event Date)**
  5. **Sosmed (Social Media/SEO)**
- **UI Focus**: These elements are now managed exclusively through the section-based edit area, reducing clutter in the primary feature menu while maintaining full editing capability.
