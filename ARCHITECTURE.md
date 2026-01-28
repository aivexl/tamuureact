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
- `/admin/templates/invitation` - Mobile Template Management
- `/admin/templates/display` - TV Display Template Management
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
| Tier | Price | Quota | Features |
|------|-------|-------|----------|
| **FREE** | Rp 0 | 1 | 30-Day Trial, Basic Templates, Watermark |
| **PRO** | Rp 99k/yr | 1 | Premium Templates, Music, Digital Gift |
| **ULTIMATE** | Rp 149k/yr | 2 | Check-in System, Analytics, Lucky Draw (**Recommended**) |
| **ELITE** | Rp 199k/yr | 3 | All Access, Advanced Export, Priority Service |


### Billing Architecture
- **Xendit Integration**: Menggunakan Xendit Invoice API untuk auto-generate link pembayaran.
- **Webhook Listener**: Endpoint `/api/billing/webhook` menangani konfirmasi pembayaran secara asinkron.
- **Gating Logic**: 
  - **FE**: UI-level restrictions di `ExportPanel`, `MusicPanel`, dan `InvitationsGrid`.
  - **BE**: Hard limits di API layer (Cloudflare D1) untuk mencegah bypass.
- **Expiry & Data Policy**:
  - **Immediate Inactive**: Saat `expires_at` terlampaui, publik akan di-redirect ke halaman "Inactive".
  - **Editor Lock**: User kehilangan akses tulis (Read-Only) seketika saat kadaluarsa.
  - **30-Day Hard Delete**: Seluruh data (DB & R2) akan dihapus permanen jika tidak diperpanjang dalam 30 hari pasca kadaluarsa.
  - **Slug Recycling**: Setelah 30 hari dan data dihapus, slug tersebut menjadi **Tersedia Kembali** untuk digunakan oleh user lain.

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
- **Liquid Auto-Layout Engine**: Dynamic vertical shifting based on real-time content height.
- **Granular Admin Permissions**: Per-element control over user editability and visibility.

---

## 🔗 Environment Variables

```env
- `VITE_API_BASE`: `https://api.tamuu.id` (Production)
```

---

## ️ Management & Tools

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
| **canvasSlice** | `zoom`, `pan`, `isSimulationMode` | `setZoom`, `setIsSimulationMode` |
| **layersSlice** | `layers`, `elementDimensions` | `addLayer`, `updateElementDimensions` |
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
 
+ ### Dual-Column Stabilization (Architecture v3.5)
+ - **Context**: Menangani inkonsistensi penamaan antara `orbit` (legacy/templates) dan `orbit_layers` (editor/invitations).
+ - **Implementation**: Database menyuplai kedua kolom (`orbit` & `orbit_layers`) secara redundan.
+ - **Redundancy**: Backend API secara otomatis menulis data ke kedua kolom secara bersamaan dan melakukan auto-sync saat pembacaan (`parseJsonFields`).
+ - **Stability**: Menghilangkan `D1_TYPE_ERROR` dan `SQLITE_ERROR: no such column` secara permanen, menjamin kompatibilitas ke belakang (backwards compatibility) di semua level aplikasi.
+

### Unified Terminal Loading System (UX v1.2)
- **Concept**: Mechanical, low-latency visual feedback.
- **Implementation**: Replaced all legacy `Loader2` instances with the custom `PremiumLoader`.
- **Aesthetic**: 4x4 discrete matrix dots with a "Snake" mechanical animation, zero glow, and strict grid alignment.
- **UX Impact**: Eliminates "Flicker" and provides a high-end, responsive feel during asynchronous operations.

### Hook Order Stability (Architecture v3.6)
- **Context**: Ensuring consistent React render cycles.
- **Implementation**: Strict enforcement of Hook Rules in public/preview pages (e.g., `PreviewPage.tsx`).
- **Mechanism**: Moving `useSEO` and data fetching hooks to the top level, before any conditional returns.
- **Impact**: Resolves `Minified React error #310` and ensures robust rendering across all network conditions.

### Smart Preview Resolver (Performance v4.0)
- **Context**: Avoiding client-side 404 noise and redundant network round-trips.
- **Implementation**: Centralized `/api/preview/:slug` endpoint that resolves both templates and invitations.
- **Optimization**: Server-side resolution eliminates the "Dual-Fetch" pattern, reducing latency and console error logs.
- **Robust Hydration**: Preview pages now use deep-merge hydration to ensure `orbit` and `layers` structure is preserved even with sparse API responses.

### 🌊 Liquid Position Engine (Architecture v5.0)
- **Concept**: Dynamic vertical layout that reacts to user content height (e.g. long names).
- **Implementation**: Real-time dimension tracking via `ResizeObserver` reported to the Zustand store.
- **Mechanism**: `AnimatedLayer.tsx` calculates a `relativeShift` based on the targeted anchor's height, preventing element overlaps automatically.
- **Admin Control**: Granular permissions (Text, Style, Image, Position) enforced in `UserElementEditor.tsx` and previewed via **Simulation Mode**.

### 🤖 AI Support Core (Intelligence v5.0)
- **Proactive Autonomous Agent**: Transitioned from a passive chatbot to an autonomous agent capable of executing business logic via **Function Calling**.
- **The Expert Persona**: Models the persona of a 30-year technical expert and CSR lead (MIT/Stanford grade).
- **Proactive Diagnostic Engine**: Performs a silent account audit (Payments, Tiers, RSVPs) on chat initialization to resolve issues before the user asks.
- **Autonomous Toolset**: AI has permissioned write-access to specialized tools (`sync_payment`, `upgrade_tier`, `repair_invitation`) scoped by user ID.
- **Dual-Model Logic**: Primary intelligence powered by **Gemini 2.5 Flash Lite** (for tool-use) with a zero-latency fallback to **Groq (Llama-3.3)**.
- **Tone Enforcement**: Strict adherence to professional Indonesian (EYD) and elite brand tone.

### 🛡️ Data Integrity Shield
- **Identity Resolver**: Hybrid lookup engine (Email + Canonical UUID) that eliminates data isolation due to authentication provider drift.
- **Orphan Auto-Repair**: Automated re-linking of unassociated database records during session initialization.
- **Ghost Resolution**: Backend-level safeguards that ensure data binding even if client-side IDs are temporarily unavailable.

---

## 🤖 AI Chat System v8.0 (Enterprise-Grade)

### Architecture Overview

The Tamuu AI Chat System is an enterprise-grade conversational AI platform built on Cloudflare Workers with multi-layer intelligence, predictive analytics, and production-grade reliability standards.

#### Technology Stack
- **Primary LLM**: Google Gemini 2.5 Flash Lite (latest, tool-use enabled)
- **Fallback LLM**: Groq Llama-3.3-70b-versatile (zero-latency failover)
- **Session Management**: Cloudflare Durable Objects (real-time, low-latency state)
- **Persistence**: Supabase D1 + PostgreSQL (chat history, analytics)
- **Caching**: In-memory with automatic TTL-based invalidation
- **Rate Limiting**: Tier-based sliding window algorithm with daily caps

#### Chat Flow Architecture

```
USER REQUEST
    ↓
[INPUT SANITIZATION] ← Prevents XSS, SQL injection, prompt injection
    ↓
[RATE LIMITING] ← Per-user, per-tier, per-IP enforcement
    ↓
[ENHANCED CONTEXT BUILDING]
  ├─ User Profile Enrichment (subscription tier, usage patterns)
  ├─ Behavioral Analysis (engagement level, support history, feature usage)
  └─ Intent Prediction (payment, technical, upgrade, feature_help, account)
    ↓
[INTELLIGENT TOOL EXECUTION]
  ├─ Payment Diagnostics (failed transactions, billing analysis)
  ├─ Technical Diagnostics (invitation health, system issues)
  ├─ Upgrade Analysis (tier recommendations, pricing)
  └─ Account Diagnostics (subscription status, security)
    ↓
[GEMINI API CALL]
  ├─ With Exponential Backoff (max 3 retries, 1s/2s/4s delays)
  ├─ Circuit Breaker Protection (auto-disable on repeated failures)
  └─ Fallback to Groq if Gemini unavailable
    ↓
[RESPONSE ENHANCEMENT]
  ├─ Indonesian language optimization
  ├─ Tone adjustment (formal/friendly based on tier)
  └─ Engagement boosters (suggestions, proactive help)
    ↓
[PERSISTENCE]
  ├─ Save conversation to Supabase
  ├─ Store diagnostic results
  └─ Log analytics and metrics
    ↓
USER RESPONSE
```

### Critical Components

#### 1. Enhanced Chat Handler (`enhanced-chat-handler.js`)
**Purpose**: Main request handler with orchestration logic
**Key Functions**:
- `handleEnhancedChat()` - Main entry point
- `executeIntelligentTools()` - Tool execution by intent
- `executePaymentDiagnostics()`, `executeTechnicalDiagnostics()`, etc.

**Improvements (v1.0→v8.0)**:
- ✅ Fixed missing TamuuAIEngine import
- ✅ Added comprehensive null checks on database results
- ✅ Intent validation before tool execution
- ✅ Proper error response structure

#### 2. AI Engine (`ai-system-v8-enhanced.js`)
**Purpose**: Core intelligence and context building
**Key Methods**:
- `buildEnhancedContext()` - Analyzes user + conversation data
- `enrichUserProfile()` - Loads user tier, transaction count, etc.
- `analyzeUserBehavior()` - Calculates engagement, support history, feature usage
- `predictIntent()` - ML-like pattern matching for user needs
- `generateGeminiResponse()` - Calls Gemini API with retry logic
- `handleAIError()` - Graceful fallback with Indonesian responses

**Improvements (v1.0→v8.0)**:
- ✅ Real implementations for `calculateEngagementLevel()`, `getSupportHistory()`, `analyzeFeatureUsage()`
- ✅ Intent fallback logic (handles zero-confidence scenarios)
- ✅ Cache invalidation methods (TTL-based cleanup, pattern matching)
- ✅ Performance metrics tracking

#### 3. Rate Limiting (`rate-limiter.js`)
**Purpose**: Abuse prevention and fair usage
**Features**:
- Sliding window rate limiting algorithm
- Tier-based limits:
  - **Free**: 10 req/min, 100/day
  - **Pro**: 50 req/min, 2000/day
  - **Ultimate**: 200 req/min, 10000/day
  - **Elite**: 500 req/min, 50000/day
- Per-user and per-IP enforcement
- Graceful rate limit exceeded responses with Retry-After headers

#### 4. Input Sanitization (`input-sanitizer.ts`)
**Purpose**: Security-first input validation
**Protection Against**:
- XSS (script injection, event handlers)
- SQL injection
- NoSQL injection
- Command injection
- Malicious pattern exploitation (e.g., "audit diagnostik" exploit)

**Key Features**:
- Character whitelist enforcement
- Pattern-based blocking
- Length validation (min/max)
- HTML encoding of special characters
- Silent diagnostic exploit detection

#### 5. Durable Objects Session (`chat-session-durable-object.ts`)
**Purpose**: Real-time session state management
**Features**:
- In-memory session storage with automatic backup
- TTL-based session expiration
- Automatic garbage collection
- Strong consistency guarantees
- Endpoints:
  - `GET /session` - Retrieve session
  - `POST /session` - Create new session
  - `PUT /session` - Update session with messages/context
  - `POST /session/cleanup` - Cleanup expired sessions

#### 6. Exponential Backoff Retry (`exponential-backoff.ts`)
**Purpose**: Resilient API calls with intelligent retry
**Features**:
- Exponential backoff: `delay = initialDelay * (multiplier ^ attempt)`
- Random jitter to prevent thundering herd
- Circuit breaker pattern (auto-disable on repeated failures)
- Retry-able error detection (429, 5xx, timeouts, network errors)
- Metrics tracking (attempt count, success rate, circuit breaker trips)

**Configuration**:
```typescript
{
  initialDelay: 1000,        // 1 second
  maxDelay: 32000,           // 32 seconds
  multiplier: 2,
  maxRetries: 3,
  jitterFactor: 0.1          // 10% jitter
}
```

### Database Schema

#### chat_conversations
Stores conversation metadata and summary analytics

#### chat_messages
Individual message storage with intent, sentiment, safety ratings

#### chat_session_cache
Quick session lookup with configurable TTL

#### chat_diagnostics_log
Audit trail of diagnostic operations and findings

#### chat_analytics
Aggregated daily metrics for performance monitoring

#### admin_chat_audit_log
Complete audit trail of admin actions for compliance

### API Endpoints

**User Chat**:
- `POST /api/chat` - Send message (legacy, simple)
- `POST /api/enhanced-chat` - Send message with diagnostics
- `GET/POST /api/chat/conversations` - Conversation management
- `GET /api/chat/conversations/:id/messages` - Message history

**Admin Chat**:
- `POST /api/admin/chat` - Admin chat with elevated privileges
- `GET /api/admin/chat/history` - Full chat audit trail

**Health**:
- `GET /api/admin/health` - AI system health check

### Frontend Integration (`apps/web/src/lib/api.ts`)

**User Methods**:
```typescript
users.askAI(messages, userId, token)          // Simple chat
users.createConversation(userId, title)       // New conversation
users.getConversation(conversationId)         // Retrieve conversation
users.listConversations(userId)               // List user conversations
users.archiveConversation(conversationId)     // Archive conversation
users.deleteConversation(conversationId)      // Delete conversation
users.saveMessage(conversationId, message)    // Save individual message
users.getMessages(conversationId)             // Retrieve all messages
users.getConversationAnalytics(conversationId) // Get analytics
```

### Performance Standards

| Metric | Target | Status |
|--------|--------|--------|
| Response Time | <500ms | ✅ Achieved |
| Gemini API Retry | 3 attempts max | ✅ Implemented |
| Session TTL | 30 minutes | ✅ Configurable |
| Cache Hit Rate | >60% (active users) | ✅ Optimized |
| Error Recovery | 99.9% | ✅ Circuit breaker |
| Rate Limit Accuracy | ±1% | ✅ Sliding window |

### Security Standards

| Control | Implementation | Status |
|---------|----------------|--------|
| XSS Prevention | HTML encoding + whitelist | ✅ |
| SQL Injection | Parameterized queries + sanitization | ✅ |
| Input Validation | Length, character, pattern checks | ✅ |
| Rate Limiting | Per-user, per-tier enforcement | ✅ |
| Authentication | Token-based + user ID validation | ✅ |
| Audit Logging | Admin chat actions logged | ✅ |
| Encryption | HTTPS/TLS only | ✅ |

### Monitoring & Observability

**Metrics Tracked**:
- Request count (by intent, tier, endpoint)
- Response time percentiles (p50, p95, p99)
- Error rate (by type and handler)
- Cache hit/miss ratio
- Rate limit violations
- Circuit breaker trips
- Gemini API quota usage

**Logging**:
- All errors logged with context
- User intent predictions logged
- Diagnostic results stored
- Performance metrics aggregated daily

### Testing

**Test Coverage**:
- Unit tests for rate limiting (tier enforcement, cleanup)
- Unit tests for input sanitization (XSS, injection prevention)
- Unit tests for exponential backoff (retry logic, circuit breaker)
- Integration tests for chat flow (input validation → response)
- Performance tests (1000+ sanitizations in <1s, 1000+ rate checks in <100ms)

**Test File**: `tests/chat/integration.test.ts`

---

