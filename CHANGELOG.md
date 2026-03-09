# Tamuu Changelog

## [0.6.51] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Final Security Fortress (Phase 4 Hardening)
- **Enterprise Security Header Suite**: Injected a comprehensive set of headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Permissions-Policy`) across all API responses. This mitigates Clickjacking, MIME-sniffing, and XSS vulnerabilities.
- **Dynamic Origin Whitelisting**: Replaced wildcard CORS with a strict dynamic whitelist. Only authorized domains (`tamuu.id`, `app.tamuu.id`) can now interface with the API production cluster.
- **SQL Guard - 100% Coverage**: Verified and hardened all remaining `UPDATE` and `DELETE` queries. Ownership checks (`AND user_id = ?`) are now enforced globally to prevent unauthorized data manipulation.
- **Edge Rate Limiting**: Implemented a lightweight IP-based rate-limiting algorithm at the Cloudflare Edge to protect against automated scraping and brute-force attacks.
- **Information Disclosure Prevention**: Hardened `console.error` in production to strip sensitive environment details while maintaining critical system error tracking.

## [0.6.50] - 2026-03-08
... (rest of changelog)
