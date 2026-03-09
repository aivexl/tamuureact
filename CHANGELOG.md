# Tamuu Changelog

## [0.6.45] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### UI/UX: Enterprise Tutorial V8 & Extreme Responsiveness
- **Robust Tutorial Launch**: Implemented a "Welcome" step fallback that doesn't depend on the DOM, ensuring the tutorial card appears 100% of the time upon page load.
- **Extended Guidance**: Added new tutorial steps for:
  - **Publish/Draft Buttons**: Guided activation status.
  - **Tab Switchers**: Explanation of "Undangan" vs "Orbit" modes.
  - **Save Button**: Crucial reminder to persist changes.
- **Dynamic Discovery Logic**: Improved the DOM scanner to retry for 5 seconds, allowing the tutorial to "attach" to elements as staggered animations complete.
- **Mobile First Layout Refinement**:
  - Re-engineered the Text Editor input area for better proportions on small screens.
  - Removed helper text clutter in the content area.
  - Lifted the tutorial card to `z-index: 1000000` via Portal to prevent mobile UI clipping.
- **Enterprise UI Reset**: Forced a one-time tutorial reset (`v8`) for all users to showcase the fix.

## [0.6.44] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### UI/UX: Text Editor Polish & Clean Up
- **Refined Input Typography**: Reverted the font size inside the text editor `textarea` to a standard readable size (`text-sm`) based on user feedback, maintaining a professional and non-intrusive look.
- **UI Simplification**: Removed the helper footer text from the text editor to reduce visual clutter and provide a more focused editing experience.

## [0.6.43] - 2026-03-08
... (rest of changelog)
