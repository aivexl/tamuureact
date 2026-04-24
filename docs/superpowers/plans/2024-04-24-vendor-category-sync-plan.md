# Vendor Category Synchronization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate dynamic categories from the database into the vendor portal.

**Architecture:** Add a public category query hook and update the vendor product form to use it.

**Tech Stack:** React, TanStack Query, TypeScript.

---

### Task 1: Add Dynamic Hook

**Files:**
- Modify: `apps/web/src/hooks/queries/useShop.ts`

- [ ] **Step 1: Import shopCategories**

```typescript
// Ensure shopCategories is imported from api
import { shop, admin, shopCategories } from '../../lib/api';
```

- [ ] **Step 2: Add useShopCategories hook**

```typescript
export const useShopCategories = () => {
    return useQuery({
        queryKey: ['shop_categories_public'],
        queryFn: () => shopCategories.listPublic()
    });
};
```

---

### Task 2: Integrate Categories into VendorProducts

**Files:**
- Modify: `apps/web/src/components/Vendor/VendorProducts.tsx`

- [ ] **Step 1: Import the new hook**

```typescript
import {
    useVendorProfile,
    useVendorProducts,
    useCreateVendorProduct,
    useUpdateVendorProduct,
    useDeleteVendorProduct,
    useShopCategories // Add this
} from '../../hooks/queries/useShop';
```

- [ ] **Step 2: Fetch and process categories**

```typescript
// Replace SHOP_CATEGORIES static array with dynamic data
const { data: categoryList = [] } = useShopCategories();
const SHOP_CATEGORIES = useMemo(() => {
    const names = categoryList.map((c: any) => c.name);
    return [...names, 'Lainnya'];
}, [categoryList]);
```

- [ ] **Step 3: Update handleEdit logic**

Update the category matching logic to use the dynamic `SHOP_CATEGORIES` list.

---

### Task 3: Verification

- [ ] **Step 1: Verify UI update**
Check that the category dropdown in "Add/Edit Product" shows categories from the database plus "Lainnya".

- [ ] **Step 2: Verify Save/Update**
Ensure products can be saved with both predefined and custom categories.
