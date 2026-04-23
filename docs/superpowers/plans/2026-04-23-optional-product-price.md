# Optional Product Price and 'Hubungi Vendor' Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow products to be uploaded without a price and display "Hubungi Vendor" when the price is missing or zero.

**Architecture:** Update React components to handle null/0/NaN `harga_estimasi` and update form validation to remove the price requirement.

**Tech Stack:** React (TypeScript), Tailwind CSS

---

### Task 1: Update Product Card Display

**Files:**
- Modify: `apps/web/src/components/Shop/ProductCard.tsx`

- [ ] **Step 1: Update price rendering logic**
Update the rendering of `harga_estimasi` to handle null, empty, 0, or non-numeric values.

```tsx
// apps/web/src/components/Shop/ProductCard.tsx
// Around line 79
<p className={`${isSmall ? 'text-[9px] md:text-xs' : 'text-[11px] md:text-sm'} font-black text-[#0A1128] truncate`}>
    {product.harga_estimasi && !isNaN(Number(product.harga_estimasi)) && Number(product.harga_estimasi) !== 0
        ? formatCurrency(product.harga_estimasi) 
        : 'Hubungi Vendor'}
</p>
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/Shop/ProductCard.tsx
git commit -m "feat: update product card to show Hubungi Vendor for missing or zero price"
```

### Task 2: Update Product Detail Display

**Files:**
- Modify: `apps/web/src/pages/Shop/ProductDetailPage.tsx`

- [ ] **Step 1: Update price rendering logic**
Update the rendering of `harga_estimasi` in the detail page.

```tsx
// apps/web/src/pages/Shop/ProductDetailPage.tsx
// Around line 656
<p className="text-4xl font-black text-[#0A1128] tracking-tighter">
    {product.harga_estimasi && !isNaN(Number(product.harga_estimasi)) && Number(product.harga_estimasi) !== 0
        ? formatCurrency(product.harga_estimasi) 
        : 'Hubungi Vendor'}
</p>
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/pages/Shop/ProductDetailPage.tsx
git commit -m "feat: update product detail to show Hubungi Vendor for missing or zero price"
```

### Task 3: Make Price Optional in Admin Form

**Files:**
- Modify: `apps/web/src/components/Admin/AdminProductListing.tsx`

- [ ] **Step 1: Update UI label for Price**
Change "(Wajib Diisi)" to "(Opsional)".

```tsx
// apps/web/src/components/Admin/AdminProductListing.tsx
// Around line 462
<div className="flex flex-col ml-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Harga (Rp)</label>
    <span className="text-[8px] font-bold text-slate-400/60 uppercase tracking-widest mt-0.5">(Opsional)</span>
</div>
```

- [ ] **Step 2: Remove price from validation**
Remove `harga_estimasi` from the required fields check in `handleSubmit`.

```tsx
// apps/web/src/components/Admin/AdminProductListing.tsx
// Around line 298
if (targetStatus === 'PUBLISHED') {
    const missingFields = [];
    if (!formData.nama_produk.trim()) missingFields.push('Nama Produk/Jasa');
    if (!formData.custom_store_name.trim()) missingFields.push('Nama Toko');
    // Removed: if (!formData.harga_estimasi) missingFields.push('Harga (Rp)');
    if (!finalKategori) missingFields.push('Kategori');
    if (!formData.kota) missingFields.push('Wilayah Operasional');
    if (formData.images.length < 2) missingFields.push('Minimal 2 Foto');
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/Admin/AdminProductListing.tsx
git commit -m "feat: make product price optional in admin upload form"
```

### Task 4: Make Price Optional in Vendor Form

**Files:**
- Modify: `apps/web/src/components/Vendor/VendorProducts.tsx`

- [ ] **Step 1: Update UI label for Price**
Change "(Wajib Diisi)" to "(Opsional)".

```tsx
// apps/web/src/components/Vendor/VendorProducts.tsx
// Around line 719
<div className="flex flex-col ml-1">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Harga (Rp)</label>
    <span className="text-[8px] font-bold text-slate-400/60 uppercase tracking-widest mt-0.5">(Opsional)</span>
</div>
```

- [ ] **Step 2: Remove price from validation**
Remove `hargaEstimasi` from the required fields check in `handleSave`.

```tsx
// apps/web/src/components/Vendor/VendorProducts.tsx
// Around line 208
if (finalStatus === 'PUBLISHED') {
    const missingFields = [];
    if (!namaProduk.trim()) missingFields.push('Nama Produk/Jasa');
    // Removed: if (!hargaEstimasi) missingFields.push('Harga (Rp)');
    if (!finalKategori) missingFields.push('Kategori');
    if (!kota) missingFields.push('Kota/Kabupaten');
    if (images.length < 2) missingFields.push('Minimal 2 Foto');
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/Vendor/VendorProducts.tsx
git commit -m "feat: make product price optional in vendor upload form"
```

### Task 5: Verification

- [ ] **Step 1: Verify code via linting**
Run `npm run lint` or equivalent to ensure no syntax errors.

```bash
npm run lint --prefix apps/web
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "test: verify optional price changes"
```
