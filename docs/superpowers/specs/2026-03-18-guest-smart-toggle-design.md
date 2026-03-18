# Design Spec: Guest Smart Toggle & Thermal Receipt System

**Date:** 2026-03-18
**Topic:** Guest Management, Scanning, and Invitation Links
**Status:** Draft

## 1. Executive Summary
Tamuu's guest experience currently faces issues with broken invitation links, missing e-tickets, and a non-functional check-out system. This design proposes a "Smart Toggle" mechanism for scanning (Scan 1 = In, Scan 2 = Out, Scan 3+ = Persistent Out) and a "Thermal Receipt" UI/UX for immediate feedback, ensuring a premium, frictionless event entry experience.

## 2. Problem Statement
- **Broken Links:** Invitation URLs using slugs (e.g., `tamuu.id/wedding-ali/budi-santoso`) fail to resolve because the API doesn't correctly handle slug-based guest lookups within a specific invitation context.
- **Missing E-Tickets:** Guests cannot see their QR codes if identity resolution fails on the `PreviewPage`.
- **Checkout Failures:** The `check-in` API always returns `SUCCESS`, preventing the frontend from identifying when a guest should be checked out.
- **Scanning Confusion:** Manual toggling between In/Out modes is slow and prone to human error.

## 3. Proposed Solution

### 3.1. Smart Toggle Logic (Backend - `tamuu-api-worker.js`)
Refactor the `/api/guests/check-in` endpoint to handle the entire lifecycle:
1.  **Identity Resolution:** Support ID, `check_in_code`, AND `slug` (if scoped to an invitation).
2.  **State Machine:**
    - **IF** `checked_in_at` is NULL:
        - Set `checked_in_at = NOW`.
        - RETURN `{ status: 'CHECK_IN_SUCCESS', data: guest }`.
    - **ELSE IF** `checked_out_at` is NULL:
        - Set `checked_out_at = NOW`.
        - RETURN `{ status: 'CHECK_OUT_SUCCESS', data: guest }`.
    - **ELSE**:
        - Do NOT change data.
        - RETURN `{ status: 'ALREADY_CHECKED_OUT', data: guest }`.

### 3.2. Thermal Receipt UI (Frontend - `GuestScannerPage.tsx`)
A high-fidelity visual component mimicking a physical thermal printer receipt:
- **Paper Effect:** White background, subtle shadow, and a "torn edge" (zigzag) bottom border.
- **Content:**
    - **Status Icon:** Large green checklist ✅ for success.
    - **Guest Info:** Name, Tier (VIP/Reguler), and Table Number.
    - **Timestamp:** "Waktu: 18:45:12".
    - **Status Label:** "CHECK-IN" or "CHECK-OUT".
    - **Gratitude Message:** "Terima kasih sudah bertamuu di acara kami." (Footer).
- **Auto-Reset:** After 3-5 seconds of display, the receipt slides out and the scanner reactivates for the next guest.

### 3.3. Identity & Link Fixes
- **`PreviewPage.tsx`:** Update `resolveGuest` to prioritize invitation context when looking up guest slugs.
- **API `getBySlug`:** Ensure the endpoint `/api/guests/slug/:slug` (or a new scoped version) works reliably.
- **QR Code:** Standardize on full URLs for QR codes to ensure the scanner can always resolve the guest via slug or ID.

## 4. Technical Architecture
- **Language:** TypeScript/React (Frontend), JavaScript (Cloudflare Worker).
- **Persistence:** SQLite (D1).
- **UX Library:** Framer Motion for receipt animations.

## 5. Success Criteria
- [ ] Scan 1 correctly marks guest as "In" without manual mode switching.
- [ ] Scan 2 correctly marks guest as "Out" and displays the gratitude message.
- [ ] Scan 3+ shows the *original* Check-out data (Idempotent).
- [ ] Invitation links (slug-based) load guest data and e-tickets 100% of the time.
- [ ] Table Guest Management reflects "Checked In" and "Checked Out" statuses accurately.

## 6. Implementation Plan (High Level)
1.  **Phase 1 (API):** Update Worker logic for Smart Toggle and Slug resolution.
2.  **Phase 2 (UI):** Build `ThermalReceipt` component in `apps/web`.
3.  **Phase 3 (Logic):** Connect `GuestScannerPage` to the new API behavior.
4.  **Phase 4 (Validation):** Test with multiple scan scenarios and broken links.
