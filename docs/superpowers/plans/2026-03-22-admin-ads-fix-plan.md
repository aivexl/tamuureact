# Admin Ads Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memperbaiki sinkronisasi status iklan di backend, menampilkan preview produk asli di modal admin, dan memastikan pembaruan data instan di frontend.

**Architecture:** 
1. **Backend:** Modifikasi logic persetujuan di API Worker untuk mengubah status kampanye secara otomatis.
2. **Frontend:** Update `AdminAdsPage` untuk fetch data produk jika `image_url` kosong dan menampilkan UI kartu produk.
3. **Data Flow:** Penguatan `useQuery` invalidation untuk sinkronisasi cache.

**Tech Stack:** React, TypeScript, TanStack Query, Cloudflare Workers (D1 Database).

---

### Task 1: Sinkronisasi Status di Backend (API Worker)

**Files:**
- Modify: `apps/api/tamuu-api-worker.js` (Sekitar baris 3091)

- [ ] **Step 1: Cari blok PATCH untuk approval iklan**
Cari kode yang menangani `path.startsWith('/api/admin/shop/ads/campaigns/') && path.endsWith('/approve')`.

- [ ] **Step 2: Tambahkan update status otomatis**
Ubah query SQL agar mengupdate kolom `status` berdasarkan `is_approved`.
```javascript
// Jika is_approved = 1 (Approve) -> status = 'ACTIVE'
// Jika is_approved = 2 (Reject) -> status = 'REJECTED'
const newStatus = is_approved === 1 ? 'ACTIVE' : (is_approved === 2 ? 'REJECTED' : 'PENDING');
await env.DB.prepare(
  "UPDATE ad_campaigns SET is_approved = ?, status = ?, rejection_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
).bind(is_approved, newStatus, rejection_reason || null, adId).run();
```

- [ ] **Step 3: Verifikasi perubahan backend**
Gunakan `curl` atau script test untuk memastikan saat disetujui, kolom `status` di DB benar-benar berubah jadi `ACTIVE`.

- [ ] **Step 4: Commit backend changes**
```bash
git add apps/api/tamuu-api-worker.js
git commit -m "fix(api): sync ad campaign status on approval/rejection"
```

---

### Task 2: Penguatan Cache Invalidation di Frontend

**Files:**
- Modify: `apps/web/src/hooks/queries/useShop.ts`

- [ ] **Step 1: Update useApproveAdCampaign mutation**
Pastikan `invalidateQueries` dijalankan dengan `await` dan tambahkan `refetchQueries`.
```typescript
onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin_ad_campaigns'] });
    await queryClient.refetchQueries({ queryKey: ['admin_ad_campaigns'] });
    toast.success('Kampanye iklan diperbarui');
}
```

- [ ] **Step 2: Commit hook changes**
```bash
git add apps/web/src/hooks/queries/useShop.ts
git commit -m "fix(web): ensure aggressive cache refetch after ad approval"
```

---

### Task 3: Tampilan Preview Produk di Modal Admin

**Files:**
- Modify: `apps/web/src/pages/Admin/AdminAdsPage.tsx`

- [ ] **Step 1: Tambahkan state untuk data produk terpilih**
Gunakan `useProductDetails` hook (yang sudah ada di `useShop.ts`) untuk mengambil detail produk jika `selectedCampaign` ada.

- [ ] **Step 2: Modifikasi UI Modal Aset Visual**
Ganti placeholder "Menggunakan Kartu Produk Standar" dengan data produk asli.
```tsx
{selectedCampaign.image_url ? (
    <img src={selectedCampaign.image_url} className="w-full h-full object-cover" />
) : (
    <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-lg bg-white/5 border border-white/10 mb-3 overflow-hidden">
             {/* Tampilkan gambar asli produk jika ada */}
        </div>
        <div className="text-sm font-bold text-white">{/* Nama Produk */}</div>
        <div className="text-xs text-teal-400 font-bold">{/* Harga */}</div>
        <div className="mt-2 px-2 py-0.5 rounded bg-white/10 text-[8px] font-bold uppercase">Kartu Produk Standar</div>
    </div>
)}
```

- [ ] **Step 3: Verifikasi Visual**
Buka modal untuk iklan tanpa gambar khusus dan pastikan informasi produk muncul.

- [ ] **Step 4: Commit UI changes**
```bash
git add apps/web/src/pages/Admin/AdminAdsPage.tsx
git commit -m "feat(web): show real product preview in admin ads modal"
```
