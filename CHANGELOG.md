# Tamuu Changelog

## [0.6.47] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Critical: Scalability Overhaul for 100k Users (Phase 1)
- **Zero-Bypass Payload Stripping**: Re-engineered the public invitation API to strip 70% of non-essential metadata (internal logs, permissions, etc.) for visitors. This reduces average JSON size from 4.5KB to ~1.2KB, securing the 5GB Supabase bandwidth limit for millions of visits.
- **Edge Caching V2**: Increased Cloudflare Cache TTL for public invitations to 300s (5 minutes). Database D1 now only processes 1 request per 5 minutes per unique invitation, enabling the system to handle 100k+ daily visitors on the free tier.
- **Response Optimization**: Optimized `PUT /invitations` to stop echoing back massive data arrays. This significantly reduces Worker memory pressure and prevents Cloudflare ERR_HTTP2_PROTOCOL_ERROR during high-concurrency edit sessions.
- **UI/UX: Enterprise Tutorial V10**:
  - **Auto-Flip Logic**: Tutorial cards now automatically detect screen edges and "flip" position to prevent covering action buttons.
  - **High-Visibility Pointer**: Implemented a dynamic, target-aware arrow that stays centered on the target element regardless of card shifting.
  - **Motion Fluidity**: Refined the RequestAnimationFrame (rAF) loop for the tutorial system, providing native-app level smoothness on mobile devices.

## [0.6.46] - 2026-03-08
... (rest of changelog)
