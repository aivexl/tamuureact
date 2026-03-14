import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shop, admin } from '../lib/api';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';

export const useChat = () => {
    const queryClient = useQueryClient();
    const token = useStore(s => s.token);

    // Conversations List
    const useConversations = () => useQuery({
        queryKey: ['chat_conversations'],
        queryFn: () => shop.listConversations(token || ''),
        enabled: !!token,
        refetchInterval: 10000 // Poll every 10s for new messages
    });

    // Message History
    const useMessages = (conversationId?: string) => useQuery({
        queryKey: ['chat_messages', conversationId],
        queryFn: () => shop.listMessages(conversationId!, token || ''),
        enabled: !!token && !!conversationId,
        refetchInterval: 3000 // Faster polling when active in a chat
    });

    // Send Message
    const sendMessageMutation = useMutation({
        mutationFn: (data: { recipient_id?: string; merchant_id?: string; content: string; type?: string }) => 
            shop.sendMessage(data, token || ''),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['chat_conversations'] });
            if (variables.recipient_id || variables.merchant_id) {
                queryClient.invalidateQueries({ queryKey: ['chat_messages'] });
            }
        }
    });

    // Mark as Read
    const markReadMutation = useMutation({
        mutationFn: (conversationId: string) => shop.markAsRead(conversationId, token || ''),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chat_conversations'] });
        }
    });

    // Admin Monitoring
    const useAdminMonitoring = () => useQuery({
        queryKey: ['admin_chat_monitoring'],
        queryFn: () => admin.listMonitoringChats(token || ''),
        enabled: !!token,
        refetchInterval: 15000
    });

    const useAdminChatHistory = (conversationId?: string) => useQuery({
        queryKey: ['admin_chat_history', conversationId],
        queryFn: () => admin.getChatHistory(conversationId!, token || ''),
        enabled: !!token && !!conversationId,
        refetchInterval: 5000
    });

    return {
        useConversations,
        useMessages,
        sendMessage: sendMessageMutation.mutate,
        isSending: sendMessageMutation.isPending,
        markAsRead: markReadMutation.mutate,
        useAdminMonitoring,
        useAdminChatHistory
    };
};
