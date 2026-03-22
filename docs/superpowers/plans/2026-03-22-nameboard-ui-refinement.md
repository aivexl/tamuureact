# NameBoard UI Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up the NameBoard UI by removing unprofessional tier badges and repositioning the tier info below the guest name with minimalist typography.

**Architecture:** Refactor the functional React component `NameBoardElement` to update its JSX structure and tailwind classes for the tier display.

**Tech Stack:** React, Tailwind CSS, Framer Motion.

---

### Task 1: Refactor Tier Display in NameBoardElement

**Files:**
- Modify: `apps/web/src/components/NameBoard/NameBoardElement.tsx`

- [ ] **Step 1: Locate the Tier rendering block**

Search for the block starting with `{displayedTier && (displayedTier === 'vip' || displayedTier === 'vvip') && (`.

- [ ] **Step 2: Update JSX structure and Tailwind classes**

Move the tier block below the name `div` and simplify the styling.

**Old Code (approx. line 191-197):**
```tsx
{displayedTier && (displayedTier === 'vip' || displayedTier === 'vvip') && (
    <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-2">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-premium-accent">
            Tamuu {displayedTier.toUpperCase()}
        </span>
    </div>
)}
<div style={getTextStyle()}>{displayedName}</div>
```

**New Code:**
```tsx
<div style={getTextStyle()}>{displayedName}</div>
{displayedTier && (displayedTier === 'vip' || displayedTier === 'vvip') && (
    <div className="mt-1 opacity-60 tracking-[0.2em] text-[10px] uppercase font-medium">
        Tamuu {displayedTier.toUpperCase()}
    </div>
)}
```

- [ ] **Step 3: Verify the changes**

Ensure the `flex-col` on the parent container (line 189) correctly stacks them vertically.
Parent: `<m.div ... className="flex flex-col items-center gap-2 text-center">`
Check if `gap-2` is too much; if so, adjust to `gap-0` and use `mt-1` on the tier.

- [ ] **Step 4: Commit the changes**

```bash
git add apps/web/src/components/NameBoard/NameBoardElement.tsx
git commit -m "feat(ui): refine NameBoard tier display to Apple enterprise standard"
```
