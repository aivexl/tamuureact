import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { useStore } from '../../store/useStore';
import { useMerchantProfile } from '../../hooks/queries/useShop';
import { MerchantSidebar } from '../../components/Merchant/MerchantSidebar';
import { MerchantOverview } from '../../components/Merchant/MerchantOverview';
import { MerchantProducts } from '../../components/Merchant/MerchantProducts';
import { MerchantSettings } from '../../components/Merchant/MerchantSettings';
import { MerchantAnalytics } from '../../components/Merchant/MerchantAnalytics';
import { MerchantAds } from '../../components/Merchant/MerchantAds';
import { ChatInterface } from '../../components/Chat/ChatInterface';
import { useSEO } from '../../hooks/useSEO';

// Icons
const MenuIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
);


export const MerchantPortalPage: React.FC = () => {
    const user = useStore(s => s.user);
    const { storeSlug } = useParams<{ storeSlug: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // CTO Fix: Only trigger query when user ID is definitively available
    const { data: merchantData, isLoading, isFetching, isError } = useMerchantProfile(user?.id);
    
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    // Tolerance buffer to prevent layout shift / premature bounce
    const [showContent, setShowContent] = useState(false);

    useSEO({
        title: 'Merchant Portal - Tamuu Nexus',
        description: 'Manage your Tamuu Storefront'
    });

    useEffect(() => {
        document.body.style.backgroundColor = '#FFFFFF';
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    // Enterprise Guard: State Resolution Phase
    useEffect(() => {
        // Wait until we have a definitive answer from the server (not just cache)
        if (!isLoading && !isFetching) {
            
            // 1. Unauthenticated -> Login
            if (!user) {
                navigate('/login', { replace: true, state: { from: location.pathname } });
                return;
            }

            // 2. Definitive lack of profile -> User Dashboard / Onboarding
            if (merchantData && merchantData.isMerchant === false) {
                console.warn('[Enterprise Guard] User is not a merchant. Redirecting to user dashboard.');
                navigate('/dashboard', { replace: true });
                return;
            }

            // 3. Has profile, but URL slug is wrong or missing -> Auto Correct
            if (merchantData?.merchant?.slug && storeSlug !== merchantData.merchant.slug) {
                console.log(`[Enterprise Guard] Slug mismatch. Expected: ${merchantData.merchant.slug}, Got: ${storeSlug}. Correcting.`);
                const currentPath = location.pathname;
                const subPathMatch = currentPath.split(`/store/${storeSlug}/`)[1];
                const subPath = subPathMatch || 'dashboard'; // Preserve where they were trying to go
                navigate(`/store/${merchantData.merchant.slug}/${subPath}`, { replace: true });
                return;
            }

            // 4. All checks passed -> Reveal UI
            if (merchantData?.merchant) {
                setShowContent(true);
            }
        }
    }, [user, isLoading, isFetching, merchantData, storeSlug, navigate, location.pathname]);


    // Render Blocking State
    if (!showContent || isLoading || (!merchantData && isFetching)) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <PremiumLoader color="#0A1128" />
                <p className="mt-6 text-sm text-slate-400 font-black uppercase tracking-widest animate-pulse">Memverifikasi Otorisasi Toko...</p>
            </div>
        );
    }

    if (isError) {
        return (
             <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-2">Gagal Memuat Profil Toko</h1>
                <p className="text-slate-500 max-w-md mx-auto mb-6">Kami mengalami kendala saat menyinkronkan data toko Anda. Mohon periksa koneksi atau coba muat ulang.</p>
                <button onClick={() => window.location.reload()} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 transition-all">Muat Ulang</button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 font-inter flex flex-col lg:flex-row overflow-hidden">
            {/* Unified Sidebar */}
            <MerchantSidebar isMobileMenuOpen={isMobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen min-w-0 lg:ml-72 bg-white relative overflow-y-auto pb-safe">
                {/* Mobile Header (Hidden on Desktop) */}
                <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-30 shadow-sm">
                    <div className="font-extrabold text-[#0A1128] tracking-tight uppercase text-xs tracking-[0.2em]">Seller Center</div>
                    <button
                        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 -mr-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Routing Area */}
                <div className="flex-1 overflow-x-hidden relative p-4 sm:p-6 lg:p-8">
                    <Routes>
                        <Route path="dashboard" element={<MerchantOverview />} />
                        <Route path="products" element={<MerchantProducts />} />
                        <Route path="messages" element={<ChatInterface mode="vendor" />} />
                        <Route path="ads" element={<MerchantAds />} />
                        <Route path="settings" element={<MerchantSettings />} />
                        <Route path="analytics" element={<MerchantAnalytics />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default MerchantPortalPage;