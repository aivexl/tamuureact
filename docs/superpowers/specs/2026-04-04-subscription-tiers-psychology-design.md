# Design Spec: Tamuu Subscription & Monetization Strategy (Apple-Standard)

## 1. Overview
Dokumen ini menetapkan strategi komprehensif untuk struktur langganan, mekanisme konversi, dan infrastruktur teknis platform Tamuu. Fokus utama adalah pada **Premium UX**, **Profitability**, dan **Scalability** dengan menerapkan prinsip psikologi ekonomi (IKEA Effect, Scarcity, Loss Aversion).

## 2. Struktur Tier & Pricing (Premium Positioning)
Tamuu tidak menyediakan paket gratis (Free). User mulai membayar untuk publikasi (Publish).

| Tier | Harga | Masa Aktif | Fitur Utama | Strategi Psikologis |
|---|---|---|---|---|
| **BASIC** | Rp 49.000 | 30 Hari | Fitur Dasar + Link `tamuu.id/slug` | **The Entry Barrier**: Konversi cepat dengan harga terjangkau. |
| **PRO** | Rp 149.000 | 90 Hari | Fitur Pro + Link `tamuu.id/slug` | **The Decoy**: Pembanding agar paket Ultimate terlihat murah. |
| **ULTIMATE**| Rp 199.000 | 365 Hari | Fitur Ultimate + Link `tamuu.id/slug` | **The Golden Ratio**: Target konversi utama (Value terbaik). |
| **ELITE** | Rp 999.000 | **Selamanya** | Fitur Elite + Opsi Custom Domain | **The Prestige Anchor**: Status VIP & investasi sekali bayar. |

## 3. Mekanisme Konversi (The IKEA Effect & Loss Aversion)
1. **Drafting Phase**: User merakit undangan secara gratis. Investasi waktu dan tenaga menciptakan rasa kepemilikan.
2. **Link Reservation**: User memilih link `tamuu.id/slug`. Sistem mengunci link tersebut selama **24 jam**.
3. **Paywall**: User harus memilih paket untuk mempublikasikan undangan dan mengamankan link secara permanen. Jika tidak dibayar dalam 24 jam, link dilepas kembali ke publik.

## 4. Mekanisme Upgrade & Retention (Prorata)
Logika sistem dirancang untuk mempermudah transisi ke tier lebih tinggi tanpa merasa rugi.
- **Upgrade**: Diizinkan kapan saja. Sistem menghitung sisa nilai rupiah paket lama dan menjadikannya potongan harga (diskon) langsung untuk paket baru.
- **No Downgrade**: Dilarang demi menjaga integritas data dan brand.
- **No Refund**: Transaksi bersifat final karena alokasi resource infrastruktur dilakukan secara instan.

## 5. Fitur Custom Domain (Khusus ELITE - BYOD Model)
Model *Bring Your Own Domain* (Bawa Domain Sendiri).
- **Aset Selamanya**: Undangan dan link `tamuu.id/slug` tetap aktif selamanya (Lifetime) setelah bayar Rp 999.000.
- **Biaya Maintenance Tahunan (Rp 249.000)**: Biaya opsional bagi user ELITE yang ingin menggunakan domain pribadi. Biaya ini murni untuk pemeliharaan jalur sistem dan SSL/HTTPS agar tetap terhubung.
- **Domain Purchase**: User membeli dan memperpanjang nama domain mereka sendiri di registrar luar. **Biaya beli domain TIDAK termasuk dalam paket ELITE atau maintenance.**

## 6. Visual Urgency (Progressive Scarcity)
Urgensi ditampilkan dengan kombinasi teks bersih dan elemen visual yang mendesak untuk memicu tindakan cepat.
- **Slot Promo Harian**: Angka acak (Randomized) ditampilkan pada setiap tier.
  - BASIC: 12 - 18 slot.
  - PRO: 8 - 12 slot.
  - ULTIMATE: 5 - 9 slot.
  - ELITE: 2 - 4 slot.
- **Design Rule (The Urgent Progress Bar)**:
  - **Loading Bar**: Bar progres tipis (height: 4px-6px) dengan warna **Merah Intens** (misal: `#EF4444`) yang menunjukkan sisa slot vs kuota harian.
  - **Tipografi**: Menggunakan SF Pro/Inter, teks abu-abu tua untuk keterangan sisa slot.
  - **Visual**: `• Tersisa 3 slot promo hari ini`
    `[███████░░░░░░░░]` (Bar merah yang semakin menipis seiring berkurangnya slot).
- **Placement**: Di bawah harga paket pada Pricing Table dan di halaman Checkout untuk memberikan dorongan terakhir sebelum pembayaran.

## 7. Roadmap Infrastruktur (Future-Proof)
1. **Fase 1 (User 1-100)**: Menggunakan **Cloudflare for SaaS** (Custom Hostnames). Target CNAME: `connect.tamuu.id`.
2. **Fase 2 (User 101+)**: Migrasi ke **Caddy Server (On-Demand TLS)** secara internal. Target CNAME tetap `connect.tamuu.id` sehingga migrasi tidak memerlukan perubahan DNS dari sisi user.

## 8. Kebutuhan Implementasi Teknis
- **Supabase**: 
  - Tabel `subscriptions`: `tier_id`, `expires_at`, `loyalty_credit`.
  - Tabel `custom_domains`: `hostname`, `maintenance_expires_at`.
- **Backend (Cloudflare Workers)**: Logika pengecekan status langganan dan routing domain ELITE.
- **Frontend**: 
  - Komponen UI Scarcity (Apple-style).
  - Kalkulator Upgrade (Prorata).
  - Grid Panel Editor: Section "Domain Pribadi" khusus role ELITE.
