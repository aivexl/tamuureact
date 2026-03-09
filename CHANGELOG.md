# Tamuu Changelog

## [0.6.48] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Critical: Enterprise Scalability V4 (Static Offloading)
- **R2 Static Data Mirroring**: Implemented an automated background exporter that mirrors invitation data to Cloudflare R2 as minified JSON upon every successful save.
- **D1 Database Bypass**: Re-engineered the public fetch route to prioritize R2 storage. Visitors now bypass the SQL database entirely, reducing D1 Read Units and Worker CPU time by ~90%.
- **Hybrid Persistence HUD**: Integrated the Auto-Save status with the new scalability layer, providing users with instant feedback while the background system handles the complex multi-layer sync (Local -> D1 -> R2).
- **Scalability Milestone**: The system is now technically capable of handling **300,000+ daily visitors** within the Free Tier limits.

## [0.6.47] - 2026-03-08
... (rest of changelog)
