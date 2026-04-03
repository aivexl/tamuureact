# Proportional Dashboard Sidebar Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the dashboard sidebar to improve proportionality and professionalism by implementing a unified scroll, removing awkward empty gaps, and optimizing vertical spacing.

**Architecture:** Switch from a nested scrolling model (where only the menu scrolls) to a unified container scroll on the entire sidebar. Remove `mt-auto` from the account section to pull it closer to the navigation menu, and reduce vertical paddings across all sidebar components.

**Tech Stack:** React, Tailwind CSS, Lucide React (icons).

---

### Task 1: Tighten Header Spacing

**Files:**
- Modify: `apps/web/src/pages/DashboardPage.tsx:220-235`

- [ ] **Step 1: Reduce top padding and profile card gaps**

```tsx
<<<<
                {/* User Profile Card */}
                {sidebarOpen && (
                    <div className="pt-10 px-6 pb-6">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-teal-200 transition-all cursor-pointer">
====
                {/* User Profile Card */}
                {sidebarOpen && (
                    <div className="pt-6 px-4 pb-4">
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-teal-200 transition-all cursor-pointer">
>>>>
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/pages/DashboardPage.tsx
git commit -m "style(dashboard): tighten sidebar profile card spacing"
```

---

### Task 2: Implement Unified Sidebar Scroll

**Files:**
- Modify: `apps/web/src/pages/DashboardPage.tsx:215-220`, `270-280`

- [ ] **Step 1: Enable vertical scroll on the aside container and remove it from nav**

```tsx
<<<<
            {/* Sidebar (Desktop Only) */}
            <aside className={`hidden md:flex fixed md:sticky top-[140px] md:top-[130px] left-0 z-40 flex-col bg-white border-r border-slate-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} h-[calc(100vh-130px)] overflow-hidden`}>
====
            {/* Sidebar (Desktop Only) */}
            <aside className={`hidden md:flex fixed md:sticky top-[140px] md:top-[130px] left-0 z-40 flex-col bg-white border-r border-slate-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} h-[calc(100vh-130px)] overflow-y-auto scrollbar-thin`}>
>>>>
```

```tsx
<<<<
                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
====
                {/* Navigation */}
                <nav className="px-4 py-2 space-y-1">
>>>>
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/pages/DashboardPage.tsx
git commit -m "feat(dashboard): implement unified sidebar scroll and remove internal nav scroll"
```

---

### Task 3: Tighten Menu Item Spacing

**Files:**
- Modify: `apps/web/src/pages/DashboardPage.tsx:240-265`

- [ ] **Step 1: Reduce vertical padding on menu links**

```tsx
<<<<
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 group"
====
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 group"
>>>>
```

```tsx
<<<<
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === item.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
====
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 group ${activeTab === item.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
>>>>
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/pages/DashboardPage.tsx
git commit -m "style(dashboard): reduce sidebar menu item vertical padding"
```

---

### Task 4: Fix Account Section Proportions

**Files:**
- Modify: `apps/web/src/pages/DashboardPage.tsx:280-300`

- [ ] **Step 1: Remove mt-auto and tighten account section items**

```tsx
<<<<
                {/* Account Section */}
                <div className="p-4 border-t border-slate-100 mt-auto space-y-4">
                    <div>
                        {sidebarOpen && <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Layanan</p>}
                        <Link to="/profile" className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group">
                            <UserIcon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                            {sidebarOpen && <span className="text-sm font-bold tracking-tight">Edit Profil</span>}
                        </Link>
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-rose-600 hover:bg-rose-50 transition-all">
                            <LogOutIcon className="w-5 h-5 flex-shrink-0" />
                            {sidebarOpen && <span className="text-sm font-bold tracking-tight">Log Out</span>}
                        </button>
                    </div>
                </div>
====
                {/* Account Section */}
                <div className="px-4 py-4 border-t border-slate-100 space-y-2 pb-10">
                    <div>
                        {sidebarOpen && <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Layanan</p>}
                        <Link to="/profile" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group">
                            <UserIcon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                            {sidebarOpen && <span className="text-sm font-bold tracking-tight">Edit Profil</span>}
                        </Link>
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-rose-600 hover:bg-rose-50 transition-all">
                            <LogOutIcon className="w-5 h-5 flex-shrink-0" />
                            {sidebarOpen && <span className="text-sm font-bold tracking-tight">Log Out</span>}
                        </button>
                    </div>
                </div>
>>>>
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/pages/DashboardPage.tsx
git commit -m "style(dashboard): optimize account section spacing and remove mt-auto"
```
