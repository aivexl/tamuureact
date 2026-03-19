# Sharing Link & Digital Card Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the guest sharing experience by implementing cleaner, slug-based URLs and fixing visual truncation on the digital invitation cards.

**Architecture:** Transition to brand-aligned URL formats across sharing and identification layers while enhancing the digital card's rendering engine for long-name support and integrated interactive feedback.

**Tech Stack:** React, TailwindCSS, Framer Motion, html2canvas, PremiumLoader v4.0.

---

### Task 1: Scanner Page Header Refinement

**Files:**
- Modify: `apps/web/src/pages/GuestScannerPage.tsx`

- [ ] **Step 1: Replace "Auto-Toggle" badge with Tamuu Logo**
Update the header section to remove the status badge and inject the monochrome logo.

```tsx
// Around line 225 in apps/web/src/pages/GuestScannerPage.tsx
<div className="flex items-center gap-3">
    <img 
        src="/images/logo-tamuu-vfinal-v1.webp" 
        alt="Tamuu" 
        className="h-6 w-auto" 
    />
</div>
```

- [ ] **Step 2: Verify header layout on mobile**
- [ ] **Step 3: Commit**

```bash
git add apps/web/src/pages/GuestScannerPage.tsx
git commit -m "style: replace auto-toggle badge with official logo in scanner header"
```

### Task 2: URL Architecture Update (Sharing & QR)

**Files:**
- Modify: `apps/web/src/pages/GuestManagementPage.tsx`
- Modify: `apps/web/src/components/Modals/QRModal.tsx`

- [ ] **Step 1: Update executeShareWhatsApp link format**
Modify the link generation in `GuestManagementPage.tsx`.

```tsx
// apps/web/src/pages/GuestManagementPage.tsx
const personalLink = `https://tamuu.id/${invitation.slug}/${guest.slug}-${guest.check_in_code}`;
```

- [ ] **Step 2: Update QRModal URL format**
Modify the `url` prop passed to `QRModal`.

```tsx
// apps/web/src/pages/GuestManagementPage.tsx:789
url={`https://tamuu.id/${invitation?.slug}/${selectedQRGuest?.slug}-${selectedQRGuest?.check_in_code || ''}`}
```

- [ ] **Step 3: Verify link format consistency**
- [ ] **Step 4: Commit**

```bash
git add apps/web/src/pages/GuestManagementPage.tsx
git commit -m "feat: transition sharing and QR links to slug-based format"
```

### Task 3: Digital Card Rendering & ID Display

**Files:**
- Modify: `apps/web/src/components/Modals/DownloadCardModal.tsx`

- [ ] **Step 1: Update personalLink format**
```tsx
// apps/web/src/components/Modals/DownloadCardModal.tsx:58
const personalLink = `https://tamuu.id/${invitation.slug}/${guest.slug}-${guest.check_in_code}`;
```

- [ ] **Step 2: Redesign Guest Information Section**
Update the name and ID display with "Zero-Cutoff" logic.

```tsx
// apps/web/src/components/Modals/DownloadCardModal.tsx:150
<div className="mt-auto flex flex-col items-start w-full pt-4 border-t border-slate-50">
    <div className="text-[7px] text-black font-bold uppercase tracking-[3px] mb-1 opacity-50">Kepada Yth:</div>
    <div className="text-[16px] font-black text-black leading-tight break-words w-full uppercase tracking-tighter max-h-[3.6em] overflow-hidden">
        {guest.name || 'TAMU UNDANGAN'}
    </div>
    <div className="text-[10px] font-black text-black uppercase tracking-widest mt-1">
        ID: {guest.check_in_code}
    </div>
</div>
```

- [ ] **Step 3: Verify monochrome styling**
- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/Modals/DownloadCardModal.tsx
git commit -m "feat: redesign guest card info section with long name support and ID"
```

### Task 4: Download Button Lifecycle Integration

**Files:**
- Modify: `apps/web/src/components/Modals/DownloadCardModal.tsx`

- [ ] **Step 1: Implement state machine logic**
Update `handleDownload` to manage success state and automatic reset.

- [ ] **Step 2: Update button UI with PremiumLoader**
```tsx
// apps/web/src/components/Modals/DownloadCardModal.tsx:190
<button
    onClick={handleDownload}
    disabled={status !== 'idle'}
    className={`
        w-full h-16 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 relative overflow-hidden
        ${status === 'downloading' ? 'bg-slate-900 cursor-wait' : ''}
        ${status === 'success' ? 'bg-green-500 shadow-xl shadow-green-100' : 'bg-slate-900 hover:bg-black text-white shadow-2xl shadow-indigo-100'}
        disabled:opacity-100
    `}
>
    {status === 'idle' && (
        <>
            <Download size={20} className="text-teal-400" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Unduh Kartu Gambar</span>
        </>
    )}

    {status === 'downloading' && (
        <PremiumLoader variant="inline" size="sm" showLabel label="Generating..." color="white" />
    )}

    {status === 'success' && (
        <>
            <Check size={20} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Berhasil</span>
        </>
    )}
</button>
```

- [ ] **Step 3: Verify interaction timing (2000ms reset)**
- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/Modals/DownloadCardModal.tsx
git commit -m "feat: integrate cyclic button lifecycle with PremiumLoader"
```

### Task 5: Final Production Verification

- [ ] **Step 1: Run full build**
Run: `npm run build:web`
Expected: SUCCESS

- [ ] **Step 2: Verify mobile responsiveness**
Check scanner and card modals on small viewports.

- [ ] **Step 3: Verify download quality**
Ensure generated PNG matches the preview precisely.
