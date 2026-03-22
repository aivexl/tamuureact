# Design Doc: Perbaikan Manajemen Iklan Admin (Admin Ads Management)

**Tanggal:** 2026-03-22
**Status:** Rancangan
**Topik:** Sinkronisasi Status Kampanye & Preview Produk Standar

## 1. Masalah (Problem)
Admin tidak dapat melihat detail produk yang sedang diiklankan jika iklan menggunakan "Kartu Produk Standar" (hanya muncul teks). Selain itu, status kampanye tidak berubah menjadi "ACTIVE" secara otomatis meskipun admin sudah menyetujuinya, bahkan setelah halaman direfresh.

## 2. Tujuan (Goals)
*   Sinkronisasi otomatis antara `is_approved` dan `status` di sisi backend.
*   Menampilkan visualisasi produk asli (nama, harga, gambar) di modal review saat `image_url` iklan kosong.
*   Memastikan frontend langsung menampilkan data terbaru setelah aksi persetujuan dilakukan tanpa perlu refresh manual.

## 3. Pendekatan Teknis (Technical Approach)

### 3.1 Backend: Sinkronisasi Status di API
*   **Target File:** `apps/api/tamuu-api-worker.js` (atau route handler terkait).
*   **Perubahan:** Saat endpoint `/api/admin/shop/ads/campaigns/:id/approve` dipanggil:
    *   Jika `is_approved = 1`: Update kolom `status = 'ACTIVE'`.
    *   Jika `is_approved = 2`: Update kolom `status = 'REJECTED'`.
    *   Validasi: Tambahkan pengecekan `budget_remaining > 0` sebelum aktivasi.

### 3.2 Frontend: Preview Produk Standar
*   **Target File:** `apps/web/src/pages/Admin/AdminAdsPage.tsx`.
*   **Perubahan:** Modifikasi area "Aset Visual" pada `Review Modal`:
    *   Mengambil data produk terkait (`product_id`) dari objek kampanye.
    *   Jika `image_url` kosong: Tampilkan komponen kartu produk sederhana yang berisi `product_image`, `nama_produk`, dan `harga_estimasi`.

### 3.3 Frontend: Invalidation Cache Agresif
*   **Target File:** `apps/web/src/hooks/queries/useShop.ts`.
*   **Perubahan:** Pada mutation `useApproveAdCampaign`:
    *   Gunakan `await queryClient.invalidateQueries({ queryKey: ['admin_ad_campaigns'] })`.
    *   Lakukan `await queryClient.refetchQueries({ queryKey: ['admin_ad_campaigns'] })` untuk memastikan data ditarik paksa dari server.

## 4. Keamanan & Validasi (Security & Validation)
*   Hanya admin yang memiliki token valid yang dapat memicu endpoint persetujuan.
*   Pengecekan integritas data produk sebelum menampilkan preview di modal.

## 5. Rencana Pengujian (Testing Plan)
1.  **Uji Persetujuan:** Menyetujui iklan PENDING dan memastikan status di tabel langsung berubah menjadi ACTIVE tanpa F5.
2.  **Uji Penolakan:** Menolak iklan dan memastikan status berubah menjadi REJECTED.
3.  **Uji Visual:** Membuka iklan tanpa `image_url` dan memverifikasi bahwa gambar/nama produk asli muncul di modal.
