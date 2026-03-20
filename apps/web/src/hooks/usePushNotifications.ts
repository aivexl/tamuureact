import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { subscribePush, unsubscribePush } from '../lib/api';

// VAPID Public Key (Generated for Tamuu Enterprise)
const VAPID_PUBLIC_KEY = 'BEFQ-IB1eNJ7l6Qz5tK5zZ12ulaJWstJz5s8KXpJtQag1QxlSJ09OxXomGIjfuEfptDc-33YoF512VeFsrvY22s';

export const usePushNotifications = () => {
    const [permission, setPermission] = useState<NotificationPermission>(
        typeof window !== 'undefined' ? Notification.permission : 'default'
    );
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const { user } = useStore();

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) return 'default' as NotificationPermission;
        const perm = await Notification.requestPermission();
        setPermission(perm);
        return perm;
    }, []);

    const subscribe = useCallback(async (silent = false) => {
        if (!('serviceWorker' in navigator)) {
            return;
        }

        setIsSubscribing(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // 1. Request/Check Permission
            const perm = await requestPermission();
            
            if (perm !== 'granted') {
                return;
            }

            // 2. Check for user before sending to backend
            if (!user) {
                console.log('[Push] Permission granted, but waiting for user to subscribe to backend');
                return;
            }

            // 3. Subscribe to Push Manager
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // 4. Send to Backend
            const keys = subscription.toJSON().keys;
            if (keys?.p256dh && keys?.auth) {
                await subscribePush({
                    userId: user.id,
                    subscription: {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: keys.p256dh,
                            auth: keys.auth
                        }
                    },
                    platform: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                    userAgent: navigator.userAgent
                });
                
                setIsSubscribed(true);
            }
        } catch (error) {
            console.error('Push Subscription Error:', error);
        } finally {
            setIsSubscribing(false);
        }
    }, [user, requestPermission]);

    // Check existing subscription on mount or when user changes
    useEffect(() => {
        const checkAndAutoSubscribe = async () => {
            if ('serviceWorker' in navigator && user) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                
                if (subscription) {
                    setIsSubscribed(true);
                } else if (Notification.permission === 'granted') {
                    // If permission is already granted but no subscription found, auto-subscribe silently
                    console.log('[Push] Permission granted but no subscription, auto-subscribing...');
                    subscribe(true);
                }
            }
        };
        checkAndAutoSubscribe();
    }, [user, subscribe]);

    const unsubscribe = useCallback(async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            if (subscription) {
                await subscription.unsubscribe();
                await unsubscribePush(subscription.endpoint);
                setIsSubscribed(false);
            }
        } catch (error) {
            console.error('Push Unsubscribe Error:', error);
        }
    }, []);

    return {
        permission,
        isSubscribed,
        isSubscribing,
        subscribe,
        unsubscribe,
        requestPermission
    };
};
