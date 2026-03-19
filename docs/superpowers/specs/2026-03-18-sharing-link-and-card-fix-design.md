# Design Spec: Sharing Link & Digital Card Optimization (Enterprise Standard v5.0)

## Goal
Improve the guest sharing experience by implementing cleaner, slug-based URLs and fixing visual truncation on the digital invitation cards. This update aligns the branding across the scanner and card interfaces with Fortune 500 standards.

## 1. URL Architecture (Clean Identity Protocol)
Transition from internal UUID-based URLs to brand-aligned, slug-based URLs.

- **New Format**: `https://tamuu.id/{invitation_slug}/{guest_slug}-{guest_short_code}`
- **Affected Components**:
    - `GuestManagementPage.tsx` (WhatsApp Share logic)
    - `DownloadCardModal.tsx` (QR Code logic)
    - `QRModal.tsx` (QR Code display)
- **Rationale**: Clean, readable URLs enhance trust and brand recognition. The inclusion of the short code prevents slug collisions.

## 2. Digital Invitation Card (Enterprise Render Engine)
Redesign the guest information section to handle long names and include identification data with a "Zero-Cutoff" guarantee.

- **Guest Name**: 
    - Remove `truncate` class.
    - Add `break-words`, `leading-tight`, and `max-h-[3.6em]` (3 lines max).
    - Font size: `text-[16px]` base, but allowing for wrap.
    - Color: Monochrome black (`text-black`) for optimal contrast and print clarity.
- **Guest ID (Short Code)**:
    - Add `ID: {check_in_code}` directly below the name.
    - Typography: Match "Tier" label precisely (`font-black uppercase text-[10px] text-black mt-0.5`).
- **Download Button Lifecycle**:
    - **State Machine**: `idle` -> `downloading` -> `success` -> `idle`.
    - **Idle**: "UNDUH KARTU GAMBAR"
    - **Processing**: Inline `PremiumLoader` (discrete matrix snake animation).
    - **Success**: Emerald background (`bg-green-500`) + "BERHASIL" + ✅ icon.
    - **Reset**: 2000ms delay before returning to idle.

## 3. Scanner Page Header (Brand Unity)
Standardize branding on the `GuestScannerPage`.

- **Action**: Replace the "Auto-Toggle" yellow badge with the official monochrome Tamuu logo (`/images/logo-tamuu-vfinal-v1.webp`).
- **Layout**: Center the logo or align it with the header's informational hierarchy.

## 4. Technical Constraints & Verification
- **Mobile First**: All layouts must be verified on 375px and 414px viewports.
- **Zero-Cutoff**: Long guest names must wrap elegantly, not overflow or disappear.
- **Performance**: High-res export at 3x scale using `html2canvas` must maintain sub-500ms latency for UI transitions.
- **Security**: URLs must be properly encoded.

## 5. Verification Plan
- **Manual Test**: Generate a card for "Bapak Haji Muhammad Abdurrahman Al-Fatih" and verify 3-line wrap.
- **Link Verification**: Click "Share WhatsApp" and verify the URL format.
- **Interaction Test**: Verify button lifecycle timing and visual parity with `PremiumLoader` v4.0.
