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

| Role | Email | Password |
|------|-------|----------|
| **User** | `test.user@tamuu.id` | `TamuuTest123!` |
| **Admin** | `test.admin@tamuu.id` | `TamuuAdmin123!` |

> ⚠️ **Note**: Akun ini untuk development/testing saja. Jangan gunakan di production.

---

##  User Editor Architecture

### Overview

Platform Tamuu memiliki dua mode editor untuk pengguna:
1. **Invitation Editor** - Editor vertikal untuk undangan digital (mode mobile-first)
2. **Display Editor** - Editor landscape (1920x1080) untuk TV/Welcome Display

### Page & Layout Structure

`
UserEditorPage.tsx              # Entry point, handles mode switching
 mode='invitation'
    UserEditorLayout.tsx    # Light-themed layout untuk mobile editing
        InvitationInfoCard  # Info undangan (title, slug, status)
        IconGridMenu        # Quick-action buttons (music, theme, share, download)
        StatusToggles       # Publish/RSVP toggles
        TemplateEditArea    # Main canvas preview + edit

 mode='welcome'
     EditorLayout.tsx        # Dark-themed layout untuk display editing
         DisplayCanvas       # Landscape Konva.js canvas
`

### Component Tree

| Component | File | Description |
|-----------|------|-------------|
| UserEditorPage | `pages/UserEditorPage.tsx` | Mode router (invitation/welcome) |
| UserEditorLayout | `Layout/UserEditorLayout.tsx` | Light wrapper layout |
| TemplateEditArea | `UserEditor/TemplateEditArea.tsx` | Preview container with Konva canvas |
| SeamlessCanvas | `Canvas/SeamlessCanvas.tsx` | Main invitation canvas (multi-section) |
| DisplayCanvas | `Canvas/DisplayCanvas.tsx` | Welcome display canvas (landscape) |
| ElementRenderer | `Canvas/ElementRenderer.tsx` | Renders all element types on canvas |
| IconGridMenu | `UserEditor/IconGridMenu.tsx` | Feature buttons grid |

### Feature Panels

| Panel | File | Function |
|-------|------|----------|
| **MusicPanel** | `Panels/MusicPanel.tsx` | Background music selection |
| **ThemePanel** | `Panels/ThemePanel.tsx` | Color theme customization |
| **SharePanel** | `Panels/SharePanel.tsx` | Share link generator |
| **ExportPanel** | `Panels/ExportPanel.tsx` | PDF/Video export (tier-gated) |

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

