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
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudflare R2 / Supabase Storage

### Infrastructure
- **Hosting**: Cloudflare Pages & Workers
- **Database**: Supabase
- **Package Manager**: pnpm (workspace)
- **Build System**: Turborepo

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

---

## 🔗 Environment Variables

```env
VITE_SUPABASE_URL=<supabase-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

---

## 📝 Notes

- Legacy Vue implementation tersedia di `tamuu-legacy/` sebagai referensi
- Semua komponen menggunakan TypeScript strict mode
- Lighthouse score target: 100/100 untuk performance
