# Design Doc: Optional Product Price and 'Hubungi Vendor' Display

**Date:** 2026-04-23
**Status:** Approved
**Topic:** Allow products to be uploaded without a price and display "Hubungi Vendor" when the price is missing or zero.

## 1. Objective
Currently, the system requires a price for every product upload. We want to make this field optional for both Admins and Vendors. Additionally, for products without a price (or a price of 0), the UI should display "Hubungi Vendor" instead of a currency value or "Tanyakan Harga".

## 2. Affected Components

### 2.1 Display Components
- **Product Card (`apps/web/src/components/Shop/ProductCard.tsx`)**: 
    - Update the price rendering logic.
    - Logic: If `harga_estimasi` is null, empty, 0, or not a number, display "Hubungi Vendor".
- **Product Detail (`apps/web/src/pages/Shop/ProductDetailPage.tsx`)**:
    - Update the price rendering logic.
    - Logic: If `harga_estimasi` is null, empty, 0, or not a number, display "Hubungi Vendor".

### 2.2 Upload Forms
- **Admin Product Listing (`apps/web/src/components/Admin/AdminProductListing.tsx`)**:
    - Update UI label from "(Wajib Diisi)" to "(Opsional)".
    - Remove `harga_estimasi` from the `handleSubmit` validation list for `PUBLISHED` status.
- **Vendor Product Listing (`apps/web/src/components/Vendor/VendorProducts.tsx`)**:
    - Update UI label from "(Wajib Diisi)" to "(Opsional)".
    - Remove `hargaEstimasi` from the `handleSave` validation list for `PUBLISHED` status.

## 3. Implementation Details

### 3.1 Helper Function (Optional Improvement)
Since the logic for determining whether to show the price or "Hubungi Vendor" is repeated, I will consider if a shared utility is needed, but given the current structure, a targeted inline update is more idiomatic for this project.

### 3.2 Price Logic Condition
The condition to trigger "Hubungi Vendor" will be:
```typescript
const shouldShowContactVendor = !product.harga_estimasi || 
                                Number(product.harga_estimasi) === 0 || 
                                isNaN(Number(product.harga_estimasi));
```

## 4. Verification Plan
- **Manual Test**:
    1. Create/Edit a product in Admin Dashboard without a price. Verify it saves successfully.
    2. Create/Edit a product in Vendor Dashboard without a price. Verify it saves successfully.
    3. View the product in the Shop (Grid/Card). Verify it says "Hubungi Vendor".
    4. View the product detail page. Verify it says "Hubungi Vendor".
    5. Test with price = 0. Verify it says "Hubungi Vendor".
    6. Test with a valid price (e.g., 50000). Verify it shows formatted currency.
