import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { billing as billingApi } from '../lib/api';

export const usePayment = () => {
    const { user, showModal } = useStore();
    const [processingTier, setProcessingTier] = useState<string | null>(null);
    const navigate = useNavigate();

    const initiatePayment = async (tier: string) => {
        console.log(`[usePayment] Initiating for tier: ${tier}`);

        if (!user) {
            console.warn('[usePayment] No user found, redirecting to login');
            navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        // @ts-ignore
        if (!window.snap) {
            console.error('[usePayment] Midtrans Snap.js not found in window');
            showModal({
                title: 'Loading Sistem',
                message: 'Sistem pembayaran sedang loading. Mohon tunggu beberapa detik atau muat ulang halaman.',
                type: 'info'
            });
            return;
        }

        // Normalize legacy tiers
        const normalizedTier = tier === 'vip' ? 'pro' : (tier === 'platinum' ? 'ultimate' : (tier === 'vvip' ? 'elite' : tier));

        setProcessingTier(normalizedTier);
        const pricing: Record<string, number> = {
            'pro': 99000,
            'ultimate': 149000,
            'elite': 199000
        };
        const amount = pricing[normalizedTier] || 99000;

        try {
            console.log(`[usePayment] Fetching Midtrans token for amount: ${amount}`);
            const data = await billingApi.getMidtransToken({
                userId: user.id,
                tier,
                amount,
                email: user.email,
                name: user.name
            });

            console.log('[usePayment] API response received:', data);


            if (data.token) {
                console.log('[usePayment] Launching Snap modal with token:', data.token);
                // @ts-ignore
                window.snap.pay(data.token, {
                    onSuccess: (result: any) => {
                        console.log('[usePayment] Success:', result);
                        navigate('/billing?status=success');
                    },
                    onPending: (result: any) => {
                        console.log('[usePayment] Pending:', result);
                        navigate('/billing?status=pending');
                    },
                    onError: (result: any) => {
                        console.error('[usePayment] Error:', result);
                        showModal({
                            title: 'Kesalahan Pembayaran',
                            message: 'Terjadi kesalahan saat memproses pembayaran. Silakan pilih metode lain atau coba lagi nanti.',
                            type: 'error'
                        });
                        setProcessingTier(null);
                    },
                    onClose: () => {
                        console.log('[usePayment] Modal closed by user');
                        setProcessingTier(null);
                    }
                });
            } else {
                console.error('[usePayment] No token in response:', data);
                const errorMsg = data.error_messages ? data.error_messages.join(', ') : (data.error || 'Gagal menghasilkan token pembayaran');
                throw new Error(errorMsg);
            }
        } catch (error: any) {
            console.error('[usePayment] Checkout failed:', error);
            showModal({
                title: 'Gagal Memproses',
                message: `Gagal memproses pembayaran: ${error.message || 'Mohon coba beberapa saat lagi'}`,
                type: 'error'
            });
            setProcessingTier(null);
        }
    };

    return { initiatePayment, processingTier };
};

