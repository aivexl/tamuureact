# Design Spec: NameBoard UI Refinement (Apple Enterprise Standard)

**Date:** 2026-03-22
**Status:** Approved
**Author:** Gemini CLI (CTO/FAANG Design Standards)

## 1. Objective
Refactor the `NameBoardElement` UI to achieve a professional "Apple Standard" aesthetic. The current implementation uses bulky capsule badges for guest tiers which creates visual noise and feels "unprofessional" for high-end enterprise welcome displays.

## 2. Problem Statement
*   **Tier Badge:** The current Tier display uses a rounded capsule (`bg-white/10`, `border`, `backdrop-blur-md`) positioned *above* the guest name.
*   **Visual Hierarchy:** The badge competes for attention with the guest's name, which should be the primary focal point.
*   **Aesthetic Inconsistency:** The "capsule" style often clashes with the more elegant typography of the name board variants (e.g., Luxury, Classic).

## 3. Proposed Solution (The "Apple" Way)
Adopt a minimalist, typography-centric approach that emphasizes whitespace and clean alignment.

### 3.1 Layout Changes
*   **Vertical Stack:** Move the Tier identifier to be **below** the guest name.
*   **De-badging:** Remove the capsule background, border, and padding. The tier will be rendered as pure text.
*   **Spacing:** Use a precise `mt-1` (4px) or `mt-2` (8px) gap between the name and the tier.

### 3.2 Typography & Styling
*   **Tier Text:** 
    *   `fontSize`: Small (10px or 11px).
    *   `fontWeight`: `font-medium` or `font-semibold` (avoiding `font-black`).
    *   `textTransform`: `uppercase`.
    *   `letterSpacing`: Wide tracking (`tracking-[0.2em]` or `tracking-[0.3em]`) to give it a "luxury label" feel.
    *   `opacity`: Muted (`opacity-60` or `opacity-70`) to maintain clear hierarchy while remaining legible.
*   **Color Logic:** 
    *   Inherit the `config.textColor` but apply the muted opacity.
    *   For `luxury` variants, ensure it maintains the same elegant tone as the name.

### 3.3 Variant Adaptation
*   Ensure the refinement looks seamless across all 28 presets (Glass, Neon, Luxury, Minimal).
*   **Mobile First:** Ensure the vertical stacking remains balanced on smaller welcome displays/mobile previews.

## 4. Implementation Details
*   Modify `apps/web/src/components/NameBoard/NameBoardElement.tsx`.
*   Remove the conditional rendering block that wraps the tier in a `div` with `bg-white/10`.
*   Update the `AnimatePresence` content to follow the new hierarchy.

## 5. Success Criteria
*   The UI feels "lighter" and more sophisticated.
*   Tier information is present but secondary.
*   No more capsule/badge containers around the tier text.
