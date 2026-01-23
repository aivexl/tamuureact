import { useState, useEffect, useMemo } from 'react';

export interface SubscriptionStatus {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    isGracePeriod: boolean; // 30 days post expiry
    daysSinceExpiry: number;
    urgency: 'low' | 'medium' | 'high' | 'critical' | 'expired';
    label: string;
}

/**
 * useSubscriptionTimer
 * High-precision hook for counting down subscription time and 
 * managing expiry states/logic.
 */
export const useSubscriptionTimer = (expiresAt: string | null): SubscriptionStatus => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return useMemo(() => {
        if (!expiresAt) {
            return {
                days: 0, hours: 0, minutes: 0, seconds: 0,
                isExpired: false,
                isGracePeriod: false,
                daysSinceExpiry: 0,
                urgency: 'low',
                label: 'Lifetime Access'
            };
        }

        const expiryDate = new Date(expiresAt);
        const diff = expiryDate.getTime() - now.getTime();
        const isExpired = diff <= 0;

        if (isExpired) {
            const absoluteDiff = Math.abs(diff);
            const daysSinceExpiry = Math.floor(absoluteDiff / (1000 * 60 * 60 * 24));
            const isGracePeriod = daysSinceExpiry <= 30;

            return {
                days: 0, hours: 0, minutes: 0, seconds: 0,
                isExpired: true,
                isGracePeriod,
                daysSinceExpiry,
                urgency: 'expired',
                label: isGracePeriod
                    ? `Expired ${daysSinceExpiry} days ago. Data will be deleted in ${30 - daysSinceExpiry} days.`
                    : 'Expired. Data deletion in progress.'
            };
        }

        // Calculate remaining time
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Determine Urgency
        let urgency: SubscriptionStatus['urgency'] = 'low';
        if (days < 3) urgency = 'critical';
        else if (days < 7) urgency = 'high';
        else if (days < 14) urgency = 'medium';

        // Super Ultra Format: 31d : 05h : 22m : 11s
        const label = days > 0
            ? `${days}d : ${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`
            : `${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;

        return {
            days, hours, minutes, seconds,
            isExpired: false,
            isGracePeriod: false,
            daysSinceExpiry: 0,
            urgency,
            label
        };
    }, [expiresAt, now]);
};
