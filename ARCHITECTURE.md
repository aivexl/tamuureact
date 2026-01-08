# Tamuu - Arsitektur Sistem

Platform undangan digital dengan arsitektur multi-domain dan monorepo.

---

## 🌐 Domain Structure

| Domain | Fungsi | Deployment |
|--------|--------|------------|
| `tamuu.id` | Landing page & marketing | Cloudflare Pages |
| `app.tamuu.id` | Dashboard & editor undangan | Cloudflare Pages |
| `api.tamuu.id` | Backend API services | Cloudflare Workers |

---

## ☁️ Cloudflare Deployments

| Project Name | Default URL | Custom Domain | Fungsi |
|--------------|-------------|---------------|--------|
| `tamuu-app` | `tamuu-app.pages.dev` | `app.tamuu.id` | Dashboard & Editor |
| `tamuu` | `tamuu.pages.dev` | `tamuu.id` | Landing page |
| `bg-remover` | - | `api.tamuu.id` | Background remover API |
| `tamuuid-cdn` | `tamuuid-cdn.shafania57.workers.dev` | `cdn.tamuu.id` | CDN worker |

---

## 🗺️ Application Sitemap

### 🌐 Public & Shared Routes (`tamuu.id` & `app.tamuu.id`)
- `/` - Landing Page (Premium design & animations)
- `/invitations` - Template Store / Gallery
- `/login` / `/signup` - Authentication (Supabase Auth)
- `/onboarding` - Magic Form creation flow (Shared)
- `/dashboard` - User Dashboard (Invitations, Displays, Profile)
- `/profile` - User Settings & Account Management
- `/upgrade` - Pricing Plans & Tier Selection
- `/billing` - Payment Status & History / Status
- `/preview/:slug` - Public Invitation Preview (Mobile-optimized)
- `/terms` / `/privacy` - Legal & Policy pages

### 🚀 App Domain Exclusive (`app.tamuu.id`)
- `/user/editor/:id` - Invitation Editor (Konva.js Canvas)
- `/user/display-editor/:id` - Landscape Welcome Display Editor
- `/guests/:id` - Guest List Management, RSVP, & QR Generator
- `/wishes` - Management of Guest Wishes/Comments
- `/tools/background-remover` - AI Background Remover Studio
- `/admin/dashboard` - System Metrics & Admin Overview
- `/admin/templates` - System Template Management
- `/admin/editor/:slug` - Template Builder (System Level)

### 📡 API & Services
- `api.tamuu.id/v1/...` - Core API (Cloudflare D1 & Workers)
- `cdn.tamuu.id/assets/...` - Asset CDN (Cloudflare R2)
- `api.tamuu.id/bg-remover` - BEN2 AI Model API


---

## 📁 Monorepo Structure

```
tamuureact/
├── apps/
│   ├── web/                    # Frontend (Vite + React + TypeScript)
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── pages/          # Page components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── stores/         # Zustand state management
│   │   │   ├── styles/         # CSS & styling
│   │   │   └── lib/            # Utilities & helpers
│   │   └── public/             # Static assets
│   │
│   └── api/                    # Backend (Cloudflare Workers)
│       ├── tamuuid-cdn-worker.js
│       ├── bg-remover-worker.js
│       └── wrangler.toml
│
├── packages/
│   └── shared/                 # Shared types & utilities
│
├── supabase/                   # Database
│   └── migrations/             # SQL migrations
│
├── tamuu-legacy/               # Legacy Vue implementation (reference)
│
└── cloudflare/                 # Cloudflare configurations
```

---

## 🛠️ Tech Stack

### Frontend (`apps/web`)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + Custom CSS
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Canvas**: Konva.js (react-konva)

### Backend (`apps/api`)
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2

### Infrastructure
- **Hosting**: Cloudflare Pages & Workers
- **Database**: Cloudflare D1 (`tamuu-db`)
- **Storage**: Cloudflare R2 (`tamuu-assets`)
- **Package Manager**: pnpm (workspace)
- **Build System**: Turborepo
- **Payment Gateway**: Xendit (Invoice API)

---

## 💰 Monetization & Billing

### Subscription Tiers (Consumer)
| Tier | Price | Features |
|------|-------|----------|
| **Free** | Rp 0 | 1 Invitation, Basic Templates |
| **VIP** | Rp 99k/yr | 1 Invitation, VIP Templates, HD PDF Export |
| **VVIP** | Rp 199k/yr | 3 Invitations, All Access, Video Export, Custom MP3 |

### Billing Architecture
- **Xendit Integration**: Menggunakan Xendit Invoice API untuk auto-generate link pembayaran.
- **Webhook Listener**: Endpoint `/api/billing/webhook` menangani konfirmasi pembayaran secara asinkron.
- **Gating Logic**: 
  - **FE**: UI-level restrictions di `ExportPanel`, `MusicPanel`, dan `InvitationsGrid`.
  - **BE**: Hard limits di API layer (Cloudflare D1) untuk mencegah bypass.

---

## 🚀 Scripts

```bash
# Development
pnpm dev           # Run all apps
pnpm dev:web       # Run web only
pnpm dev:api       # Run API only

# Build
pnpm build         # Build all
pnpm build:web     # Build web only

# Deploy
pnpm deploy        # Deploy all
pnpm deploy:web    # Deploy web to Cloudflare Pages
pnpm deploy:api    # Deploy API to Cloudflare Workers
```

---

## ✨ Key Features

- **Landing Page** - Premium design dengan animasi dinamis
- **User Dashboard** - Manajemen undangan & profil
- **Invitation Editor** - Drag-and-drop canvas editor
  - Element animations (entrance & looping)
  - Motion path animations
  - Background removal (AI/BEN2)
  - Multi-section support
  - Copy/paste between canvases
- **Template Store** - Galeri template undangan
- **Admin Dashboard**: Dedicated control center for system management
- **Display Editor**: Landscape (1920x1080) editor for TV displays
- **Billing & Upgrade Center**:
  - Prestige UI for tier selection
  - Xendit payment link integration
  - Auto-provisioning system
  - Usage tracking (invitation counts)

---

## 🔗 Environment Variables

```env
VITE_API_URL=https://api.tamuu.id
```

---

## �️ Management & Tools

| Service | Dashboard Link | Fungsi |
|---------|----------------|--------|
| **Cloudflare** | [dash.cloudflare.com](https://dash.cloudflare.com) | Pages, Workers, D1, R2, DNS |
| **Supabase** | [supabase.com/dashboard](https://supabase.com/dashboard) | Authentication & Auth Config |
| **Xendit** | [dashboard.xendit.co](https://dashboard.xendit.co) | Payment tracking & API Keys |
| **GitHub** | [github.com/aivexl/tamuureact](https://github.com/aivexl/tamuureact) | Source Control & CI/CD |

---

## �📝 Notes

- Legacy Vue implementation tersedia di `tamuu-legacy/` sebagai referensi
- Semua komponen menggunakan TypeScript strict mode
- Lighthouse score target: 100/100 untuk performance
