# Plan: Enterprise Push Notification System for Tamuu

Acting as CTO, I have designed a high-performance, resilient, and scalable push notification architecture for the Tamuu ecosystem. This plan follows the "Mobile First" and "Clean Light Enterprise" standards.

## 1. High-Level Architecture
- **Infrastructure**: Cloudflare Workers (API) + Cloudflare D1 (Persistence) + Web Push Protocol (Standard).
- **Authentication**: VAPID (Voluntary Application Server Identification) for secure push delivery without third-party dependencies (FCM fallback if needed).
- **State Management**: Frontend handles subscription state; Backend stores encrypted subscription endpoints.

---

## 2. Phase 1: Database & Backend (D1)

### 2.1 Schema Expansion
We will create a dedicated table for push subscriptions to support multi-device delivery per user.

```sql
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    subscription_json TEXT NOT NULL, -- JSON string of the PushSubscription object
    platform TEXT, -- 'mobile', 'desktop', 'tablet'
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_push_user ON push_subscriptions(user_id);
```

### 2.2 API Endpoints (tamuu-api-worker.js)
- `POST /api/push/subscribe`: Validates and persists the subscription.
- `POST /api/push/unsubscribe`: Removes the subscription entry.
- `POST /api/admin/push/send`: Orchestrator for sending notifications.
    - Parameters: `title`, `body`, `icon`, `url`, `target` (all | user_ids | tiers).
    - Uses `web-push` logic within the worker to trigger browser push.

---

## 3. Phase 2: Frontend Integration (Service Workers)

### 3.1 Service Worker (sw.js)
Implement a robust background listener to handle `push` and `notificationclick` events.
- **Push Event**: Displays the notification even when the app is closed.
- **Click Event**: Routes the user to the specific `url` (deep-linking).

### 3.2 Subscription Logic (usePushNotifications hook)
- Request permissions with a premium UI prompt.
- Handle VAPID key exchange.
- Auto-resubscribe on token expiration.

---

## 4. Phase 3: Admin Dashboard (Command Center)

### 4.1 Sidebar Integration
Add "Push Notifications" tab in `AdminLayout.tsx` under "User Feedback".
- **Icon**: `BellRing` (Lucide).
- **Route**: `/admin/push-notifications`.

### 4.2 Push Command Center Page
A professional interface to broadcast messages:
- **Rich Editor**: Preview how the notification looks on Mobile/Desktop.
- **Audience Targeting**: Select between "All Users", "Pro Users", "Free Tier", or "Specific Merchant".
- **Real-time Analytics**: Tracking delivery success rates (if using a gateway) or simple "sent" count.

---

## 5. Phase 4: UX & Aesthetics (Icon & UI)
- **Notification Icon**: A stylized, animated bell icon in the user dashboard.
- **Glassmorphism Panels**: Consistent with the "Merchant Portal V6.0" design language.
- **Haptic Feedback**: (Optional) For mobile users when a notification is received while the app is open.

---

## 6. Security & Compliance
- **GDPR/CCPA**: Users must opt-in; clear "Disable" button in Profile Settings.
- **Security**: Subscriptions are scoped to user IDs; Admin tokens strictly validated.

---

## Next Steps:
1. Generate VAPID Keys.
2. Execute D1 Migration for `push_subscriptions`.
3. Implement Backend API Logic.
4. Scaffold Admin Dashboard Page.
5. Register Service Worker in Frontend.
