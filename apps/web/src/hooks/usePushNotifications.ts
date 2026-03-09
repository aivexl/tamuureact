import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { subscribePush, unsubscribePush } from '../lib/api';
import toast from 'react-hot-toast';

// VAPID Public Key (Generated for Tamuu Enterprise)
const VAPID_PUBLIC_KEY = 'BEFQ-IB1eNJ7l6Qz5tK5zZ12ulaJWstJz5s8KXpJtQag1QxlSJ09OxXomGIjfuEfptDc-33YoF512VeFsrvY22s';

export const usePushNotifications = () => {
    const [permission, setPermission] = useState<NotificationPermission>(
        typeof window !== 'undefined' ? Notification.permission : 'default'
    );
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const { user } = useStore();

    // Check existing subscription on mount
    useEffect(() => {
        const checkSubscription = async () => {
            if ('serviceWorker' in navigator && user) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                setIsSubscribed(!!subscription);
            }
        };
        checkSubscription();
    }, [user]);

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

    const subscribe = useCallback(async () => {
        if (!user) return;
        if (!('serviceWorker' in navigator)) {
            toast.error('Browser does not support push notifications');
            return;
        }

        setIsSubscribing(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // 1. Request Permission
            const perm = await Notification.requestPermission();
            setPermission(perm);
            
            if (perm !== 'granted') {
                toast.error('Permission for notifications was denied');
                return;
            }

            // 2. Subscribe to Push Manager
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // 3. Send to Backend
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
                toast.success('You are now subscribed to push notifications!');
            }
        } catch (error) {
            console.error('Push Subscription Error:', error);
            toast.error('Failed to subscribe to push notifications');
        } finally {
            setIsSubscribing(false);
        }
    }, [user]);

    const unsubscribe = useCallback(async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            if (subscription) {
                await subscription.unsubscribe();
                await unsubscribePush(subscription.endpoint);
                setIsSubscribed(false);
                toast.success('Unsubscribed from push notifications');
            }
        } catch (error) {
            console.error('Push Unsubscribe Error:', error);
            toast.error('Failed to unsubscribe');
        }
    }, []);

    return {
        permission,
        isSubscribed,
        isSubscribing,
        subscribe,
        unsubscribe
    };
};
