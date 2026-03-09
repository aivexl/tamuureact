# Tamuu Changelog

## [0.6.52] - 2026-03-09
**Status**: 🟢 Deployed
**Environment**: Production

### Engineering: Comprehensive Testing & Security Finalization
- **Modern Testing Stack**: Migrated from basic testing attempts to a robust **Vitest + React Testing Library (RTL)** infrastructure in the web package.
- **Enterprise-Grade Validation**: Implemented and passed **25 critical test cases** covering:
  - **Security Ownership**: Verified cross-user data isolation.
  - **XSS Protection**: Validated Input Sanitizer efficacy against malicious scripts.
  - **Scalability Logic**: Confirmed Fingerprint Deduplication and Payload Pruning functionality.
  - **Business Flows**: Simulated Midtrans Sandbox payments and Merchant/Shop discovery.
- **Architecture Stability**: Established `IndexedDB` local persistence logic paired with a **Professional Exit Guard** to ensure zero data loss during high-concurrency edit sessions.
- **Security Audit Cleanup**: Performed final global purge of production console logs and information disclosure vulnerabilities.

## [0.6.51] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Final Security Fortress (Phase 4 Hardening)
- **Enterprise Security Header Suite**: Injected CSP, X-Frame-Options, and more across all API responses.
- **Dynamic Origin Whitelisting**: Restricted API access to `tamuu.id` and `app.tamuu.id`.
- **SQL Guard - 100% Coverage**: Enforced global ownership checks on all destructive operations.

## [0.6.50] - 2026-03-08
... (rest of changelog)
