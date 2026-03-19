# Final Vendor Data Synchronization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Synchronize the remote D1 database roles and identifiers to complete the "merchant" to "vendor" transition.

**Architecture:** Direct SQL execution via Wrangler CLI against the remote D1 production environment. Using transactions to ensure referential integrity during ID renames.

**Tech Stack:** Cloudflare D1, Wrangler CLI, SQL.

---

### Task 1: User Role Transformation

- [ ] **Step 1: Verify current role counts**
Run: `cd apps/api && npx wrangler d1 execute tamuu-db -c wrangler-api.toml --remote --command "SELECT role, COUNT(*) as count FROM users GROUP BY role;"`
Expected: Record count for 'merchant' role.

- [ ] **Step 2: Execute role update**
Run: `cd apps/api && npx wrangler d1 execute tamuu-db -c wrangler-api.toml --remote --command "UPDATE users SET role = 'vendor' WHERE role = 'merchant';"`
Expected: Success message from D1.

- [ ] **Step 3: Verify update result**
Run: `cd apps/api && npx wrangler d1 execute tamuu-db -c wrangler-api.toml --remote --command "SELECT role, COUNT(*) as count FROM users GROUP BY role;"`
Expected: 0 records for 'merchant', all previous merchants now counted under 'vendor'.

### Task 2: System Identifier Migration (Atomic Rename)

- [ ] **Step 1: Check for existence of admin-merchant**
Run: `cd apps/api && npx wrangler d1 execute tamuu-db -c wrangler-api.toml --remote --command "SELECT id FROM shop_vendors WHERE id = 'admin-merchant';"`
Expected: 1 row.

- [ ] **Step 2: Execute atomic rename transaction**
Run:
```bash
cd apps/api && npx wrangler d1 execute tamuu-db -c wrangler-api.toml --remote --command "
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;
UPDATE shop_vendors SET id = 'admin-vendor' WHERE id = 'admin-merchant';
UPDATE shop_products SET vendor_id = 'admin-vendor' WHERE vendor_id = 'admin-merchant';
UPDATE shop_contacts SET vendor_id = 'admin-vendor' WHERE vendor_id = 'admin-merchant';
UPDATE shop_analytics SET vendor_id = 'admin-vendor' WHERE vendor_id = 'admin-merchant';
COMMIT;
PRAGMA foreign_keys = ON;
"
```
Expected: Success message.

- [ ] **Step 3: Verify ID rename**
Run: `cd apps/api && npx wrangler d1 execute tamuu-db -c wrangler-api.toml --remote --command "SELECT id FROM shop_vendors WHERE id = 'admin-vendor'; SELECT vendor_id FROM shop_products WHERE vendor_id = 'admin-vendor' LIMIT 1;"`
Expected: IDs correctly returned as 'admin-vendor'.

### Task 3: Final Audit & Cleanup

- [ ] **Step 1: Run comprehensive "merchant" sweep**
Run: `cd apps/api && npx wrangler d1 execute tamuu-db -c wrangler-api.toml --remote --command "SELECT 'users' as tbl, count(*) FROM users WHERE role = 'merchant' UNION ALL SELECT 'vendors', count(*) FROM shop_vendors WHERE id = 'admin-merchant' UNION ALL SELECT 'products', count(*) FROM shop_products WHERE vendor_id = 'admin-merchant';"`
Expected: All counts should be 0.

- [ ] **Step 2: Remove temporary migration files**
Run: `rm apps/api/migrations/0062_refactor_merchant_to_vendor.sql` (if already executed or not needed anymore).

- [ ] **Step 3: Final confirmation**
Report completion to the user.
