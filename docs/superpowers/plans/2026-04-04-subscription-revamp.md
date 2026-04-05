# Implementation Plan: Tamuu Subscription & Monetization Strategy (TOTAL CLEAN BREAK)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement new tier system, update pricing/durations, and perform a total removal of legacy tiers (VIP, VVIP, Platinum, Free).

**Architecture:** 
1.  **Database**: Migrate all existing user tiers to new names. Add `maintenance_expires_at` and `loyalty_credit`.
2.  **Backend**: Remove ALL legacy tier logic. Only use basic, pro, ultimate, elite. Update payment sync.
3.  **Frontend**: Revamp UpgradePage and Editor with new naming and Apple-style urgency.

---

### Task 1: Database Migration & Schema (COMPLETED)
- [x] Step 1: Add new migration for subscription revamp
- [x] Step 2: Apply migration to local D1
- [x] Step 3: Commit schema changes

---

### Task 2: Database Data Scrubbing (The Clean Break)

**Files:**
- Create: `apps/api/migrations/0036_cleanup_legacy_tiers.sql`

- [ ] **Step 1: Create migration to update all existing user records**
```sql
UPDATE users SET tier = 'pro' WHERE tier = 'vip';
UPDATE users SET tier = 'ultimate' WHERE tier = 'platinum';
UPDATE users SET tier = 'elite' WHERE tier = 'vvip';
UPDATE users SET tier = 'basic' WHERE tier = 'free';
```
- [ ] **Step 2: Apply migration**
`cd apps/api && npx wrangler d1 migrations apply tamuu-db --local`
- [ ] **Step 3: Commit**
`git add . && git commit -m "db: permanently migrate legacy tiers to new names"`

---

### Task 3: Backend - Remove All Legacy Code & Update Activation Logic

**Files:**
- Modify: `apps/api/tamuu-api-worker.js`
- Modify: `apps/api/ai-system-v8-enhanced.js`

- [ ] **Step 1: Scrub `tamuu-api-worker.js`**
  - Hapus semua baris yang mengandung `vip`, `vvip`, `platinum`, `free`.
  - Gunakan hanya `basic`, `pro`, `ultimate`, `elite`.
  - **Penting:** Pastikan perhitungan `expires_at` dimulai dari **WAKTU PEMBAYARAN** (`Date.now()`), bukan dari waktu signup.
  - Update durasi paket: 
    - Basic: +30 hari dari waktu bayar.
    - Pro: +90 hari dari waktu bayar.
    - Ultimate: +365 hari dari waktu bayar.
    - Elite: Lifetime (Set ke 2099-12-31).
- [ ] **Step 2: Scrub AI System prompts**
  - Hapus branding "VVIP" di `ai-system-v8-enhanced.js`.
- [ ] **Step 3: Commit**
`git add . && git commit -m "refactor(api): remove legacy tiers and set duration from purchase time"`

---

### Task 4: Frontend - Revamp UI (Basic, Pro, Ultimate, Elite)
... (Hanya menggunakan nama baru)
