# Design Spec: Blog SEO & Image Metadata Implementation

**Date:** 2026-05-12
**Topic:** Adding SEO fields and Image Alt tags to Blog Admin Editor
**Status:** Draft

## 1. Problem Statement
Currently, the Blog Admin Editor (`/admin/blog/new`) lacks fields for manual SEO management (SEO Title, SEO Description, SEO Keywords) and accessibility (Image Alt Text). While the database and API support these fields, the UI does not expose them, forcing the system to rely on automatic fallbacks (Title and Excerpt).

## 2. Proposed Changes

### 2.1 Admin Panel (Frontend - `apps/web`)
**File:** `apps/web/src/pages/blog/AdminBlogEditor.tsx`
- Add new state variables: `seoTitle`, `seoDescription`, `seoKeywords`, `imageAlt`.
- Update `useEffect` to populate these states when editing existing posts.
- Update `handleSave` to include these fields in the payload sent to the API.
- **UI Updates (Sidebar):**
    - Add "Featured Image Alt" input under the Thumbnail section.
    - Add "SEO & Metadata" collapsible or static section in the sidebar.
    - Include inputs for `SEO Title`, `SEO Description`, and `SEO Keywords`.

### 2.2 API Backend (`apps/api`)
**File:** `apps/api/tamuu-api-worker.js`
- **Verification:** Ensure the POST/PUT handlers correctly bind `seo_title`, `seo_description`, `seo_keywords`, and `image_alt`. (Already confirmed present in codebase).
- **Database:** Ensure columns exist in D1. (Already confirmed present via migration `0033`).

### 2.3 Public Site (Frontend - `apps/main`)
**File:** `apps/main/src/app/blog/[slug]/page.tsx`
- Ensure `generateMetadata` uses the manual SEO fields if present.
- Ensure `image_alt` is used in the blog layout and schema.org markup.

## 3. Implementation Details

### UI Design (Sidebar Integration)
- **Image Alt**: Text input with placeholder "Deskripsi gambar untuk tuna netra/SEO..."
- **SEO Title**: Text input with character counter (max 60 recommended).
- **SEO Description**: Textarea with character counter (max 160 recommended).
- **SEO Keywords**: Text input for comma-separated values.

## 4. Verification Plan
1. **Creation Test**: Create a new blog post with manual SEO data and save. Verify DB via API check.
2. **Persistence Test**: Re-open the saved post in the editor. Verify fields are populated.
3. **Public Display Test**: Visit the blog post in `apps/main`. Check Page Source for `<title>` and `<meta name="description">`.
4. **Accessibility Test**: Check the featured image tag for the correct `alt` attribute.

## 5. Risk Assessment
- **Breaking Changes**: None. Adding optional fields.
- **Performance**: Negligible impact on payload size.
- **Data Integrity**: Ensure empty strings are handled correctly (defaulting to fallbacks).
