import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE } from '../../lib/api';

export const useNotifications = (userId?: string) => {
    return useQuery({
        queryKey: ['notifications', userId],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/api/notifications?userId=${userId}`);
            if (!res.ok) throw new Error('Failed to fetch notifications');
            return res.json();
        },
        enabled: !!userId,
        refetchInterval: 30000, // Poll every 30 seconds
    });
};

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, notificationId }: { userId: string; notificationId?: string }) => {
            const res = await fetch(`${API_BASE}/api/notifications/read`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, notificationId })
            });
            if (!res.ok) throw new Error('Failed to mark notification as read');
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['notifications', variables.userId] });
        }
    });
};
