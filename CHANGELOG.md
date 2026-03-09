# Tamuu Changelog

## [0.6.49] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### UI/UX: Smart Manual Save & Clean HUD
- **Zero-Indicator UI**: Removed all auto-save visual HUDs to provide a completely clean and focused editing interface as requested.
- **Smart Fingerprint Deduplication**: The manual save button now calculates a data fingerprint before execution. If data is unchanged, it bypasses the API call, saving Cloudflare request units while providing instant "Success" feedback to the user.
- **Professional Exit Guard**: Implemented standard `beforeunload` browser protection. Users are now warned if they attempt to leave the editor with unsaved changes in the cloud.
- **Background Auto-Save Purge**: Permanently removed the 5-second background auto-save timer to ensure 100% of API requests are user-initiated and intentional.

## [0.6.48] - 2026-03-08
... (rest of changelog)
