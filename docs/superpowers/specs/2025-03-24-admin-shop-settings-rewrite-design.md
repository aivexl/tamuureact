# Design Spec: AdminShopSettings Component Rewrite

## Overview
Rewrite the `AdminShopSettings.tsx` component to fix code corruption, remove duplications, and enhance the UI/UX for managing shop configurations, promo carousels, and popups.

## Requirements
- **Vertical Spacing**: Reduce main container spacing from `space-y-8` to `space-y-4`.
- **Internal Padding**: Reduce tab content container padding from `p-8` to `p-6`.
- **Promo Popups**:
    - Multi-select checklist for `placements` and `tiers`.
    - Options for placements: `homepage`, `shop`, `dashboard`, `vendor`, `admin`.
    - Options for tiers: `free`, `pro`, `ultimate`, `elite`.
    - Full field population on edit.
    - Submit button label "Simpan Perubahan" when editing.
    - Pencil icon for edit action.
- **Carousel Slides**:
    - Individual row state management.
    - Independent "Simpan" button per row.
- **System Integrity**:
    - No duplications in the `return` statement.
    - Valid TypeScript/React code.

## Architecture
- **Component**: `AdminShopSettings` (Functional Component).
- **State Management**:
    - `currentTab`: Manages active view.
    - `newPopup` / `editingPopupId`: Manages popup form state.
    - `slides` / `popups` / `ads` / `categories`: Data states.
- **Sub-components**:
    - `CarouselRow`: Handles individual slide editing.
    - `AdEditorRow`: Handles individual ad editing.
    - `PlacementItem`: Display/Remove placement items.
    - `MultiSelectChecklist`: (Internal or helper) for Popup placements/tiers.

## UI/UX
- Maintain the enterprise dark theme.
- Use `lucide-react` for icons.
- Use `framer-motion` for tab transitions.
- Use `react-hot-toast` for feedback.

## Implementation Details
1. **Cleanup**: Start with a fresh skeleton.
2. **State Hooks**: Initialize all necessary states for categories, config, carousel, popups, and ads.
3. **API Integration**: Connect to existing `shop`, `admin`, and `storage` API helpers.
4. **Form Logic**:
    - Implement multi-select toggle logic for strings (e.g., "home,shop,vendor").
    - Implement "all" selection behavior: if all items are selected, store "all".
5. **Validation**: Ensure `image_url` is present for carousels and popups.
