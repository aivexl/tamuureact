# SEO UI in Admin Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add SEO UI fields (image alt, SEO title, SEO description, SEO keywords) to the Admin Blog Editor sidebar.

**Architecture:** Modify the `AdminBlogEditor.tsx` component to include new input fields in the `aside` element. The `image_alt` field will be integrated into the Thumbnail section, and a new "SEO & Metadata" group will be added at the bottom of the sidebar.

**Tech Stack:** React (TypeScript), Tailwind CSS, Lucide Icons.

---

### Task 1: Add Image Alt field under Thumbnail

**Files:**
- Modify: `apps/web/src/pages/blog/AdminBlogEditor.tsx`

- [ ] **Step 1: Add the image alt input field**

Insert the input field under the thumbnail preview div within the "Thumbnail" section.

```tsx
<div className="space-y-4">
    <label className="text-[10px] font-black uppercase tracking-widest text-teal-500">Thumbnail</label>
    {/* ... existing thumbnail div ... */}
    <div onClick={() => fileInputRef.current?.click()} className="aspect-video rounded-2xl border-2 border-dashed border-white/10 bg-black/40 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500/50 transition-all overflow-hidden relative">
        {featuredImage ? <img src={featuredImage} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-white/10" />}
        <input type="file" ref={fileInputRef} onChange={async (e) => {
            const file = e.target.files?.[0]; if (!file) return;
            const formData = new FormData(); formData.append('file', file);
            const res = await api.assets.upload(formData); if (res.url) setFeaturedImage(res.url);
        }} className="hidden" />
    </div>
    <input 
        type="text" 
        value={imageAlt} 
        onChange={e => setImageAlt(e.target.value)} 
        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white outline-none focus:border-teal-500" 
        placeholder="Deskripsi gambar (Alt Text)..." 
    />
</div>
```

- [ ] **Step 2: Verify the change**
Ensure the input field is visible and correctly styled.

---

### Task 2: Add SEO & Metadata Section

**Files:**
- Modify: `apps/web/src/pages/blog/AdminBlogEditor.tsx`

- [ ] **Step 1: Add the SEO & Metadata section at the bottom of the sidebar container**

Insert the new section after the Excerpt field, separated by a border-top.

```tsx
<div className="pt-6 border-t border-white/5 space-y-4">
    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-500">
        <Globe className="w-3 h-3" /> SEO & Metadata
    </label>
    <div className="space-y-3">
        <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase">SEO Title</span>
            <input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-teal-500" placeholder="Custom SEO Title..." />
        </div>
        <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase">SEO Description</span>
            <textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-400 outline-none focus:border-teal-500 resize-none" placeholder="Custom meta description..." />
        </div>
        <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase">SEO Keywords</span>
            <input type="text" value={seoKeywords} onChange={e => setSeoKeywords(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-teal-500" placeholder="keyword1, keyword2..." />
        </div>
    </div>
</div>
```

- [ ] **Step 2: Verify layout**
Ensure the section is correctly separated and all fields are responsive.

---

### Task 3: Final Verification and Commit

**Files:**
- Modify: `apps/web/src/pages/blog/AdminBlogEditor.tsx`

- [ ] **Step 1: Perform full verification**
  - Check that all new fields correctly update their respective state variables.
  - Verify that saving/updating a post correctly sends the new fields to the API.

- [ ] **Step 2: Commit changes**

```bash
git add apps/web/src/pages/blog/AdminBlogEditor.tsx
git commit -m "feat(admin): add seo ui fields to blog editor sidebar"
```
