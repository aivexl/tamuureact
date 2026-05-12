# Design Doc: Implement SEO UI in Admin Sidebar

## Objective
Enhance the blog editor by adding user interface elements for SEO metadata and image alternative text in the admin sidebar. This will allow content creators to optimize their posts for search engines and accessibility directly from the editor.

## Proposed Changes

### 1. Image Alt Text Field
- **Location**: In the sidebar, directly under the featured image (Thumbnail) preview.
- **Implementation**: Add a new text input field within the Thumbnail container.
- **State**: Bind to the existing `imageAlt` state variable.
- **Style**: Match the existing input styling (rounded-xl, dark background, teal focus border).

### 2. SEO & Metadata Section
- **Location**: At the bottom of the sidebar card.
- **Implementation**: Add a new container with a top border to separate it from the excerpt section.
- **Fields**:
    - **SEO Title**: Text input for custom meta title.
    - **SEO Description**: Textarea for custom meta description (3 rows).
    - **SEO Keywords**: Text input for comma-separated keywords.
- **Icons**: Use the `Globe` icon from `lucide-react` for the section header.
- **State**: Bind to existing `seoTitle`, `seoDescription`, and `seoKeywords` state variables.

## Data Flow
- User inputs data into the new fields.
- React state variables are updated via `onChange` handlers.
- When the user clicks "Save" or "Publish", the `handleSave` function already includes these variables in the payload sent to the API.

## Verification Plan
- **Manual Verification**:
    - Navigate to the Blog Admin Editor.
    - Verify that the Image Alt field appears under the Thumbnail.
    - Verify that the SEO & Metadata section appears at the bottom of the sidebar.
    - Enter data into all new fields and save the post.
    - Refresh the page and ensure the data is persisted.
- **Visual Check**: Ensure the layout remains consistent and responsive across different screen sizes.
