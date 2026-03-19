# Design Spec: Final Data Layer Synchronization (Merchant to Vendor)

## Goal
Perform an atomic synchronization of the data layer to align all user roles and system identifiers with the new "vendor" nomenclature, ensuring 100% parity between the database and the application code.

## 1. User Role Transformation (RBAC Alignment)
To maintain the integrity of the Role-Based Access Control (RBAC) system, all existing merchant accounts must be transitioned to the vendor role.

- **Action**: Update the `role` column in the `users` table.
- **SQL**: `UPDATE users SET role = 'vendor' WHERE role = 'merchant';`
- **Impact**: All users previously identified as merchants will now be recognized as vendors by the API and frontend logic.

## 2. System Identifier Migration (Atomic Update)
The hardcoded system ID `admin-merchant` used for global listings must be renamed to `admin-vendor`. Due to foreign key constraints, this must be performed as an atomic operation with temporary constraint suspension.

- **Execution Protocol**:
    1. Disable foreign key checks: `PRAGMA foreign_keys = OFF;`
    2. Start transaction: `BEGIN TRANSACTION;`
    3. Update parent table: `UPDATE shop_vendors SET id = 'admin-vendor' WHERE id = 'admin-merchant';`
    4. Update child references:
        - `UPDATE shop_products SET vendor_id = 'admin-vendor' WHERE vendor_id = 'admin-merchant';`
        - `UPDATE shop_contacts SET vendor_id = 'admin-vendor' WHERE vendor_id = 'admin-merchant';`
        - `UPDATE shop_analytics SET vendor_id = 'admin-vendor' WHERE vendor_id = 'admin-merchant';`
    5. Commit transaction: `COMMIT;`
    6. Re-enable foreign key checks: `PRAGMA foreign_keys = ON;`

## 3. Verification & Audit Plan
Post-execution audit queries will be performed to guarantee zero "merchant" remnants in the data layer.

- **Audit Queries**:
    - `SELECT COUNT(*) FROM users WHERE role = 'merchant';` (Expected: 0)
    - `SELECT id FROM shop_vendors WHERE id = 'admin-merchant';` (Expected: 0)
    - `SELECT vendor_id FROM shop_products WHERE vendor_id = 'admin-vendor' LIMIT 1;` (Expected: >0)

## 4. Rollback Strategy
If any query fails, the transaction will be automatically rolled back by the D1 execution engine, reverting the database to its pre-synchronization state.
