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
- `/admin/dashboard` - System Metrics & Admin Overview
- `/admin/templates` - System Template Management
- `/admin/editor/:slug` - Template Builder (System Level)

### 📡 API & Services
- `api.tamuu.id/v1/...` - Core API (Cloudflare D1 & Workers)
- `cdn.tamuu.id/assets/...` - Asset CDN (Cloudflare R2)


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
- **State Management**: Zustand (UI state) + TanStack Query (server state)
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
- **Package Manager**: npm (workspace)
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
npm run dev           # Run all apps (Turbo)
npm run dev:web       # Run web only
npm run dev:api       # Run API only

# Build
npm run build         # Build all
npm run build:web     # Build web only

# Deploy
npm run deploy:web:app     # Deploy Editor to Cloudflare Pages
npm run deploy:web:landing # Deploy Landing to Cloudflare Pages
npm run deploy:api         # Deploy API to Cloudflare Workers
```

---

## ✨ Key Features

- **Landing Page** - Premium design dengan animasi dinamis
- **User Dashboard** - Manajemen undangan & profil
- **Invitation Editor** - Drag-and-drop canvas editor
  - Element animations (entrance & looping)
  - Motion path animations
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

---

## 🔐 Testing Accounts
👤 Akun User (Pengguna Biasa)
Email: user@tamuu.id
Password: Testing123!
Role: user
🔑 Akun Admin
Email: admin@tamuu.id
Password: Admin123!
Role: admin

---

##  User Editor Architecture (Enterprise Premium)

### Overview

Platform Tamuu mengadopsi arsitektur **Tabbed Editor** kelas dunia untuk memberikan pengalaman editing yang intuitif namun powerful:

1. **Invitation Editor (Tab 1)** - Mobile-first canvas (414x896) for core invitation content.
2. **Cinematic Stage (Tab 2)** - Desktop master stage (800x896) for cinematic wings and wide-screen visuals.

### Render Engine (Zero-Cutoff)

The Tamuu V3 Engine uses a modular, DOM-based rendering approach:
- **Zero-Cutoff Guarantee**: `overflow: visible` is applied to all design viewports, allowing elegant bleeding for decorative elements.
- **Top-Anchored Scaling (v2)**: Core invitation rendering uses `transform-origin: top center` to ensure 1:1 parity with mobile browser behavior, keeping header elements and corner decorations perfectly aligned.
- **Multi-Baseline Scaling**: Dynamic scaling engine in `UserKonvaPreview.tsx` that adapts to both 414px and 800px design baselines without visual distortion.

### Page & Layout Structure

```
UserEditorPage.tsx              # Entry point, handles mode switching
 mode='invitation'
    UserEditorLayout.tsx        # Premium light-themed layout
        TemplateEditArea        # Main canvas preview + Tabbed Edit flow
            Invitation Tab      # Section reordering & content editing
            Orbit Tab           # Cinematic Wing configuration
```

### Component Tree

| Component | File | Description |
|-----------|------|-------------|
| UserEditorPage | `pages/UserEditorPage.tsx` | High-level router & state initialization |
| TemplateEditArea | `UserEditor/TemplateEditArea.tsx` | Central logic for tab switching & reordering |
| UserKonvaPreview | `UserEditor/UserKonvaPreview.tsx` | DOM-based render engine (Zero-Cutoff) |
| UserElementEditor | `UserEditor/UserElementEditor.tsx` | Dynamic content editor for elements |

### Feature Panels

| Panel | File | Function |
|-------|------|----------|
| **MusicPanel** | `Panels/MusicPanel.tsx` | Advanced background music controller |
| **ThemePanel** | `Panels/ThemePanel.tsx` | Global design system customization |
| **ExportPanel** | `Panels/ExportPanel.tsx` | Tier-gated HD export engine |

---


##  State Management (Zustand)

### Store Architecture

`
store/useStore.ts               # Combined store with undo/redo (zundo)
 canvasSlice.ts              # Zoom, pan, project metadata
 layersSlice.ts              # Element CRUD, selection, transforms
 sectionsSlice.ts            # Multi-section management, orbit (TV stage)
 uiSlice.ts                  # UI state (modals, sidebars)
 authSlice.ts                # User session & auth state
 useProfileStore.ts          # User profile data (separate store)
`

### Key State Slices

| Slice | Key States | Actions |
|-------|------------|---------|
| **canvasSlice** | `zoom`, `pan`, `projectName` | `setZoom`, `setPan` |
| **layersSlice** | `layers`, `selectedLayerId` | `addLayer`, `updateLayer`, `deleteLayer` |
| **sectionsSlice** | `sections`, `activeSectionId`, `orbit` | `addSection`, `setActiveSection`, `setOrbitLayers` |
| **uiSlice** | `showLayerPanel`, `showSidebar` | `toggleLayerPanel`, `toggleSidebar` |
| **authSlice** | `user`, `token` | `setUser`, `logout` |

### Persistence & Undo/Redo

- **Local Storage**: Canvas state persisted to `tamuu-storage`
- **Temporal History**: 50-step undo/redo via `zundo` middleware
- **Rehydration Guard**: Automatic sanitization of corrupted local storage data

---

##  Canvas Architecture (Konva.js)

### Element Types

`	ypescript
type LayerType =
  | 'text'          // Text with rich styling
  | 'image'         // Images from R2 or external URLs
  | 'icon'          // Lucide icons
  | 'shape'         // Rectangles, circles, custom shapes
  | 'button'        // CTA buttons
  | 'countdown'     // Event countdown timer
  | 'maps'          // Embedded Google Maps
  | 'frame'         // Photo frame overlays
  | 'frame-image';  // Frame with embedded image
`

### Animation System

- **Entrance Animations**: `fade-in`, `slide-up`, `scale-in`, `bounce`
- **Looping Animations**: `pulse`, `float`, `shimmer`, `rotate`
- **Motion Paths**: Custom bezier curve animations with keyframes

### Section-based Design

Invitations are organized into multiple **Sections** (e.g., Opening, Bride & Groom, Event Details), each with:
- Independent background color/image
- Own set of elements
- Transition animations between sections

---

## 🦄 Unicorn Level Stability

### Smart Slug Resolver
- **Policy**: Zero-friction onboarding.
- **Implementation**: API secara otomatis mendeteksi konflik slug. Jika slug sudah ada, sistem akan menambahkan suffix unik (e.g., `test` -> `test-a9b2`) daripada mengembalikan error `409 Conflict`.
- **UX Impact**: Pengguna tidak akan pernah melihat error "Slug sudah digunakan" saat pertama kali membuat undangan.

### Seamless Cross-Domain Navigation
- **Architecture**: Bridge antara `tamuu.id` (Landing) dan `app.tamuu.id` (Editor).
- **Mechanism**: Deteksi domain otomatis di level client. Jika undangan berhasil dibuat di domain publik, sistem melakukan hard redirect ke subdomain `app` untuk mem-bypass route protection di domain publik.
- **UX Impact**: Transisi instan dari pemilihan template ke editor tanpa redirect loop ke home page.

