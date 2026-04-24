# Vendor Category Synchronization Design

**Goal:** Integrate dynamic categories into the vendor portal to replace the static category list.

**Architecture:**
- Fetch shop categories from the API using a React Query hook.
- Synchronize the vendor product form to use these dynamic categories.
- Maintain support for custom categories via the "Lainnya" option.

**Key Files:**
- `apps/web/src/hooks/queries/useShop.ts`: Add `useShopCategories` hook.
- `apps/web/src/components/Vendor/VendorProducts.tsx`: Update to use dynamic categories.

---

## 1. Dynamic Hook
Add `useShopCategories` to `useShop.ts`:
```typescript
export const useShopCategories = () => {
    return useQuery({
        queryKey: ['shop_categories_public'],
        queryFn: () => shopCategories.listPublic()
    });
};
```

## 2. Vendor Portal Integration
In `VendorProducts.tsx`:
- Use `useShopCategories()`.
- Derived categories: `const categories = useMemo(() => [...(data || []).map(c => c.name), 'Lainnya'], [data]);`
- Update `handleEdit` logic to check against dynamic names.
- Update `handleSave` to use the dynamic selection.

## 3. Testing
- Verify categories are fetched and displayed.
- Verify "Lainnya" still shows custom input.
- Verify saving works for both dynamic and custom categories.
