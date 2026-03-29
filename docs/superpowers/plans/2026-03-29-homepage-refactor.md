# Homepage (ShopPage) Next.js Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the existing ShopPage into a standalone Next.js 15 application (`apps/home`) with a "Total White" aesthetic and Server-First (RSC) architecture.

**Architecture:** Next.js App Router with React Server Components for data fetching, URL-based filtering for SEO, and Edge Runtime deployment via OpenNext.

**Tech Stack:** Next.js 15, Tailwind CSS, TypeScript, OpenNext, Cloudflare Workers.

---

### Task 1: Initialize `apps/home` Project

**Files:**
- Create: `apps/home/package.json`
- Create: `apps/home/next.config.ts`
- Create: `apps/home/tailwind.config.ts`
- Create: `apps/home/tsconfig.json`

- [ ] **Step 1: Create `package.json`**
```json
{
  "name": "@tamuu/home",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "15.1.0",
    "lucide-react": "^0.468.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "framer-motion": "^11.15.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "eslint": "^8",
    "eslint-config-next": "15.1.0"
  }
}
```

- [ ] **Step 2: Create `next.config.ts` (Edge Runtime optimized)**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "tamuu.id"],
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.tamuu.id' },
      { protocol: 'https', hostname: 'tamuu.id' }
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 3: Create `tailwind.config.ts` (Total White Tokens)**
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#0F172A", // slate-900
      },
      boxShadow: {
        'ink': '0 2px 15px -3px rgba(0,0,0,0.04), 0 4px 6px -2px rgba(0,0,0,0.02)',
      }
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 4: Commit**
```bash
git add apps/home/package.json apps/home/next.config.ts apps/home/tailwind.config.ts
git commit -m "feat(home): initialize Next.js application structure"
```

---

### Task 2: Core API Layer (Server-Side)

**Files:**
- Create: `apps/home/src/lib/api.ts`

- [ ] **Step 1: Implement Server-Side API Client**
```typescript
const API_BASE = 'https://api.tamuu.id';

export async function getShopData() {
  const [carousel, categories, products, ads] = await Promise.all([
    fetch(`${API_BASE}/api/shop/carousel`, { next: { revalidate: 3600 } }).then(res => res.json()),
    fetch(`${API_BASE}/api/categories`, { next: { revalidate: 86400 } }).then(res => res.json()),
    fetch(`${API_BASE}/api/shop/products/discovery`, { next: { revalidate: 60 } }).then(res => res.json()),
    fetch(`${API_BASE}/api/shop/ads?position=FEATURED_PRODUCT_HOME`, { next: { revalidate: 300 } }).then(res => res.json())
  ]);

  return {
    slides: carousel.slides || [],
    categories: categories || [],
    products: products.products || [],
    featuredAds: ads.ads || []
  };
}
```

- [ ] **Step 2: Commit**
```bash
git add apps/home/src/lib/api.ts
git commit -m "feat(home): add server-side API client with ISR caching"
```

---

### Task 3: Root Layout & Global Styles (Total White)

**Files:**
- Create: `apps/home/src/app/globals.css`
- Create: `apps/home/src/app/layout.tsx`

- [ ] **Step 1: Create `globals.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #0f172a;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Zero-Jank Scroll Optimization */
.content-auto {
  content-visibility: auto;
  contain-intrinsic-size: 1px 5000px;
}
```

- [ ] **Step 2: Create `layout.tsx`**
```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tamuu - Platform Undangan Digital & Vendor Pernikahan Premium",
  description: "Temukan vendor pernikahan terbaik dan buat undangan digital eksklusif hanya di Tamuu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-white min-h-screen selection:bg-amber-100">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add apps/home/src/app/globals.css apps/home/src/app/layout.tsx
git commit -m "feat(home): implement Total White root layout"
```

---

### Task 4: UI Primitives (Bespoke Tailwind)

**Files:**
- Create: `apps/home/src/components/ui/Container.tsx`
- Create: `apps/home/src/components/ui/Typography.tsx`

- [ ] **Step 1: Create `Container.tsx`**
```typescript
export const Container = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);
```

- [ ] **Step 2: Create `Typography.tsx`**
```typescript
export const Heading = ({ children, level = 1, className = "" }: { children: React.ReactNode, level?: 1|2|3, className?: string }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const styles = {
    1: "text-3xl md:text-5xl font-black tracking-tighter text-slate-900",
    2: "text-xl md:text-3xl font-bold tracking-tight text-slate-900",
    3: "text-lg md:text-xl font-bold text-slate-800"
  };
  return <Tag className={`${styles[level]} ${className}`}>{children}</Tag>;
};
```

- [ ] **Step 3: Commit**
```bash
git add apps/home/src/components/ui/
git commit -m "feat(home): add pure Tailwind UI primitives"
```

---

### Task 5: Main Shop Page (Server Entry)

**Files:**
- Create: `apps/home/src/app/page.tsx`

- [ ] **Step 1: Implement Main Entry with RSC**
```typescript
import { getShopData } from "@/lib/api";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Typography";

export default async function HomePage() {
  const data = await getShopData();

  return (
    <main className="py-20">
      <Container>
        <header className="mb-12">
          <Heading level={1}>Inspirasi Pernikahan Terbaik</Heading>
          <p className="text-slate-500 mt-4 text-lg">Temukan vendor pilihan untuk hari spesial Anda.</p>
        </header>
        
        {/* Placeholder for Components in next tasks */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {data.products.slice(0, 8).map((p: any) => (
            <div key={p.id} className="aspect-[4/5] bg-slate-50 rounded-2xl animate-pulse" />
          ))}
        </section>
      </Container>
    </main>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add apps/home/src/app/page.tsx
git commit -m "feat(home): implement main page with Server Components"
```

---

### Task 6: Deployment Bridge (OpenNext)

**Files:**
- Create: `apps/home/wrangler.toml`

- [ ] **Step 1: Create `wrangler.toml`**
```toml
name = "tamuu-home"
main = ".open-next/worker.js"
compatibility_date = "2024-09-23"

[site]
bucket = ".open-next/assets"

[vars]
NEXTJS_ENV = "production"
```

- [ ] **Step 2: Commit**
```bash
git add apps/home/wrangler.toml
git commit -m "feat(home): add Cloudflare Workers deployment config"
```
