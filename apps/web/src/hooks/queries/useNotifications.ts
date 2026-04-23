import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '../../lib/api';

export const useNotifications = (userId?: string) => {
    return useQuery({
        queryKey: ['notifications', userId],
        queryFn: () => notifications.list(),
        enabled: !!userId,
        refetchInterval: 30000, // Poll every 30 seconds
    });
};

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ notificationId }: { userId: string; notificationId?: string }) => 
            notifications.markRead(notificationId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['notifications', variables.userId] });
        }
    });
};
