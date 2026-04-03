# Design Doc: Proportional Dashboard Sidebar Redesign

This document outlines the redesign of the dashboard sidebar to improve proportionality, professionalism, and usability by eliminating unnecessary internal scrolling and optimizing vertical space.

## Problem Statement
*   **Internal Scrolling:** The main navigation menu scrolls within a fixed-height container even when there is significant empty space at the bottom of the sidebar.
*   **Proportions:** Large vertical paddings and excessive "mt-auto" spacing create an unbalanced look, making the sidebar feel disconnected from the rest of the layout.
*   **Usability:** Critical menu items are "cut off" and require scrolling on standard laptop screens despite the footer being far away.

## Goals
*   **Unified Scrolling:** Make the entire sidebar a single scrollable unit to maximize visible content.
*   **Optimized Spacing:** Tighten vertical paddings and margins for a denser, more professional "SaaS" feel.
*   **Visual Hierarchy:** Maintain clear separation between the user profile, main navigation, and account services.

## Proposed Changes

### 1. Structure & Scrolling (Unified Scroll)
*   **Sidebar (`aside`):**
    *   Change `overflow-hidden` to `overflow-y-auto`.
    *   Maintain `h-[calc(100vh-130px)]` fixed height relative to the header.
*   **Navigation (`nav`):**
    *   Remove `flex-1` and `overflow-y-auto`.
    *   Allow the navigation list to expand to its natural height.
*   **Account Section:**
    *   Remove `mt-auto`. The section will now follow naturally after the navigation menu.
    *   Add `pb-10` to ensure the last item doesn't sit flush against the bottom of the viewport.

### 2. Space Optimization
*   **User Profile Header:** Reduce top padding from `pt-10` to `pt-6`.
*   **Menu Items:** Reduce vertical padding from `py-3.5` to `py-2.5`.
*   **Section Gaps:** Ensure consistent `px-6` (24px) horizontal padding across all sections for alignment.

### 3. Visual Polish
*   Retain `border-t border-slate-100` for the Account Section to provide a clear visual break between navigation and system actions (Profile, Logout).
*   Ensure the active state (`bg-slate-900`) remains prominent and visually balanced within the tighter padding.

## Success Criteria
*   The main menu no longer has its own scrollbar independent of the sidebar.
*   All menu items are visible on a standard 1080p screen without scrolling.
*   The "Log Out" button sits closer to the menu items when the menu is short, but pushes down naturally if the menu grows.

## Testing Strategy
*   **Visual Inspection:** Verify spacing on desktop and laptop screen heights.
*   **Scroll Behavior:** Ensure the entire sidebar scrolls smoothly if the menu exceeds the viewport height.
*   **Active States:** Confirm that clicking tabs still highlights the correct item correctly.
