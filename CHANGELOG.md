# Tamuu Changelog

## [0.6.50] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Critical: Security & IP Protection Hardening
- **Enterprise-Grade Content Shield**: Implemented `contextMenu` blocking and `user-select: none` across the Preview Engine. This prevents unauthorized copying of text, design, and image assets from user invitations.
- **Strict CORS Origin Locking**: Transitioned from a wildcard CORS policy to a strict whitelist (tamuu.id, app.tamuu.id). Requests from unauthorized origins are now blocked at the Edge.
- **Production Log Purging**: Injected a global silencer for `console.log` and `console.debug` in production environments to prevent sensitive internal data disclosure.
- **Database Authorization Hardening**: Refactored sensitive SQL operations (e.g., Product Deletion) to enforce ownership verification (`AND merchant_id = ?`). This closes critical ID Object Injection vulnerabilities.
- **Zero-Trust Metadata Masking**: Improved API responses to ensure internal IDs and logs never leak to public visitors.

## [0.6.49] - 2026-03-08
... (rest of changelog)
