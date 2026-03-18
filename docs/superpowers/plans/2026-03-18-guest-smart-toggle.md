# Guest Smart Toggle & Thermal Receipt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automate the guest check-in/out process with a "Smart Toggle" mechanism and provide a high-fidelity "Thermal Receipt" visual feedback for event staff.

**Architecture:** 
- **Backend:** Update Cloudflare Worker (`tamuu-api-worker.js`) to handle state transitions (In -> Out -> Stay Out) and support slug-based lookups.
- **Frontend:** Create a `ThermalReceipt` component and integrate it into `GuestScannerPage.tsx` for automated, timed feedback.
- **Link Resolution:** Fix `PreviewPage.tsx` to correctly resolve guest identities from URLs.

**Tech Stack:** React (TypeScript), Framer Motion, Lucide React, Cloudflare Workers (D1/SQLite).

---

### Task 1: API - Smart Toggle & Identity Resolution

**Files:**
- Modify: `apps/api/tamuu-api-worker.js`

- [ ] **Step 1: Update `/api/guests/slug/:slug` to handle invitation context**
    Modify the slug lookup to optionally accept `invitation_id` from query params for better precision.

- [ ] **Step 2: Refactor `/api/guests/check-in` into a Smart Toggle**
    Implement the following logic:
    ```javascript
    // Find guest...
    if (!guest.checked_in_at) {
        await db.prepare('UPDATE guests SET checked_in_at = ? WHERE id = ?').bind(now, guest.id).run();
        return json({ status: 'CHECK_IN_SUCCESS', data: guest });
    } else if (!guest.checked_out_at) {
        await db.prepare('UPDATE guests SET checked_out_at = ? WHERE id = ?').bind(now, guest.id).run();
        return json({ status: 'CHECK_OUT_SUCCESS', data: guest });
    } else {
        return json({ status: 'ALREADY_CHECKED_OUT', data: guest });
    }
    ```

- [ ] **Step 3: Test API with `curl`**
    Run: `curl -X POST http://localhost:8787/api/guests/check-in -d '{"check_in_code": "TEST123"}'`
    Expected: `CHECK_IN_SUCCESS` (1st time), `CHECK_OUT_SUCCESS` (2nd time), `ALREADY_CHECKED_OUT` (3rd time).

- [ ] **Step 4: Commit API changes**
    `git add apps/api/tamuu-api-worker.js && git commit -m "feat(api): implement smart guest toggle logic"`

---

### Task 2: UI - Thermal Receipt Component

**Files:**
- Create: `apps/web/src/components/Shop/ThermalReceipt.tsx` (or `Shared/ThermalReceipt.tsx`)

- [ ] **Step 1: Create the `ThermalReceipt` component with Framer Motion**
    Use a white background, `shadow-xl`, and a zigzag bottom border (CSS `clip-path` or SVG).
    Include:
    - Status Icon (✅)
    - Guest Name & Tier
    - Timestamp
    - Status Text ("BERHASIL MASUK" / "BERHASIL KELUAR")
    - Footer: "Terima kasih sudah bertamuu di acara kami"

- [ ] **Step 2: Add animations**
    Entrance: `initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}`
    Exit: `exit={{ x: 100, opacity: 0 }}`

- [ ] **Step 3: Commit UI component**
    `git add apps/web/src/components/Shared/ThermalReceipt.tsx && git commit -m "feat(ui): add ThermalReceipt component for guest feedback"`

---

### Task 3: Integration - Scanner Logic Refactor

**Files:**
- Modify: `apps/web/src/pages/GuestScannerPage.tsx`

- [ ] **Step 1: Remove manual toggle state**
    Remove `action` state (`check-in` vs `check-out`) and the manual toggle button.

- [ ] **Step 2: Update `performAction` to use the Smart API**
    Call `/api/guests/check-in` and handle the returned `status` to show the `ThermalReceipt`.

- [ ] **Step 3: Implement auto-reset timer**
    ```typescript
    useEffect(() => {
        if (scannedGuest) {
            const timer = setTimeout(() => setScannedGuest(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [scannedGuest]);
    ```

- [ ] **Step 4: Commit Scanner integration**
    `git add apps/web/src/pages/GuestScannerPage.tsx && git commit -m "feat(scanner): automate check-in/out with thermal receipt"`

---

### Task 4: Fix - Invitation Links & E-Ticket Resolution

**Files:**
- Modify: `apps/web/src/pages/PreviewPage.tsx`
- Modify: `apps/web/src/lib/api.ts`

- [ ] **Step 1: Update `api.guests.getBySlug` to include invitation context**
    Modify `api.ts` to accept an optional `invitationId`.

- [ ] **Step 2: Fix resolution in `PreviewPage.tsx`**
    Ensure `resolveGuest` uses the `invitation.id` when calling `getBySlug`.

- [ ] **Step 3: Verify E-Ticket visibility**
    Ensure `GuestQRTrigger` renders correctly once the guest is resolved.

- [ ] **Step 4: Commit Fixes**
    `git commit -am "fix(guests): resolve identity correctly for slug-based invitation links"`

---

### Task 5: Verification - End-to-End Test

- [ ] **Step 1: Verify Guest Management Table**
    Ensure the table reflects the new `checked_out_at` timestamps.

- [ ] **Step 2: Final Verification**
    Scan a test QR code 3 times and verify the state transitions and UI feedback.
