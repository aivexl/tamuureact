import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { billing as billingApi } from '../lib/api';
import { toast } from 'react-hot-toast';

export const usePayment = () => {
    const { user, showModal } = useStore();
    const [processingTier, setProcessingTier] = useState<string | null>(null);
    const navigate = useNavigate();

    const loadSnapScript = async (): Promise<boolean> => {
        // Check if Snap is already loaded
        if ((window as any).snap) {
            console.log('[usePayment] Snap.js already loaded');
            return true;
        }

        const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
        
        if (!clientKey) {
            console.error('[usePayment] VITE_MIDTRANS_CLIENT_KEY is not configured');
            return false;
        }

        try {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                const isProd = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';
                
                // Use SANDBOX by default unless explicitly set to production
                script.src = isProd
                    ? 'https://app.midtrans.com/snap/snap.js'
                    : 'https://app.sandbox.midtrans.com/snap/snap.js';
                script.setAttribute('data-client-key', clientKey);
                script.crossOrigin = 'anonymous';
                
                script.onload = () => {
                    console.log('[usePayment] Snap.js loaded successfully from:', script.src);
                    resolve(true);
                };
                
                script.onerror = (err) => {
                    console.error('[usePayment] Failed to load Snap.js:', err);
                    reject(new Error('Gagal memuat sistem pembayaran Midtrans'));
                };
                
                document.body.appendChild(script);
            });
            return true;
        } catch (err: any) {
            console.error('[usePayment] Snap.js load error:', err);
            return false;
        }
    };

    const initiatePayment = async (tier: string) => {
        console.log(`[usePayment] Initiating for tier: ${tier}`);

        if (!user) {
            console.warn('[usePayment] No user found, redirecting to login');
            navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        // Load Snap Script
        const snapLoaded = await loadSnapScript();
        if (!snapLoaded) {
            showModal({
                title: 'Konfigurasi Error',
                message: 'Sistem pembayaran tidak dapat dimuat. Pastikan VITE_MIDTRANS_CLIENT_KEY sudah dikonfigurasi dengan benar.',
                type: 'error'
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
                
                // Ensure snap is available before calling
                if (!(window as any).snap) {
                    throw new Error('Snap.js tidak termuat dengan benar');
                }
                
                // @ts-ignore
                window.snap.pay(data.token, {
                    onSuccess: (result: any) => {
                        console.log('[usePayment] Success:', result);
                        // Sync user data before navigating
                        navigate('/billing?status=success');
                        setProcessingTier(null);
                    },
                    onPending: (result: any) => {
                        console.log('[usePayment] Pending:', result);
                        navigate('/billing?status=pending');
                        setProcessingTier(null);
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
                        // ENTERPRISE UX: If they close the modal, the transaction is technically PENDING 
                        // until expired or paid. Redirect to billing to show status.
                        navigate('/billing?status=pending');
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

    const processAdPayment = async (data: { userId: string, email: string, name: string, tier: string, amount: number }) => {
        console.log(`[usePayment] Ad Payment for tier: ${data.tier}, amount: ${data.amount}`);

        // Ensure snap is loaded
        if (!(window as any).snap) {
            await new Promise((resolve, reject) => {
                const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
                const script = document.createElement('script');
                const isProd = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';
                script.src = isProd ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js';
                script.setAttribute('data-client-key', clientKey);
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        }

        try {
            const res = await billingApi.getMidtransToken({
                userId: data.userId,
                tier: data.tier,
                amount: data.amount,
                email: data.email,
                name: data.name
            });

            if (res.token) {
                // @ts-ignore
                window.snap.pay(res.token, {
                    onSuccess: () => navigate('/billing?status=success'),
                    onPending: () => navigate('/billing?status=pending'),
                    onError: () => {
                        showModal({ title: 'Gagal', message: 'Pembayaran gagal', type: 'error' });
                    }
                });
            }
        } catch (error: any) {
            toast.error(error.message || 'Gagal memproses pembayaran');
        }
    };

    return { initiatePayment, processAdPayment, processingTier };
};

