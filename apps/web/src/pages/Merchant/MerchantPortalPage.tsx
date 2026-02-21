import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useMerchantProfile } from '../../hooks/queries/useShop';
import { MerchantSidebar } from '../../components/Merchant/MerchantSidebar';
import { MerchantOverview } from '../../components/Merchant/MerchantOverview';
import { MerchantProducts } from '../../components/Merchant/MerchantProducts';
import { MerchantSettings } from '../../components/Merchant/MerchantSettings';
import { MerchantAnalytics } from '../../components/Merchant/MerchantAnalytics';
import { MerchantAds } from '../../components/Merchant/MerchantAds';
import { useSEO } from '../../hooks/useSEO';

// Icons
const MenuIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
);


export const MerchantPortalPage: React.FC = () => {
    const user = useStore(s => s.user);
    const { data: merchantData, isLoading } = useMerchantProfile(user?.id);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    useSEO({
        title: 'Merchant Portal - Tamuu Nexus',
        description: 'Manage your Tamuu Storefront'
    });

    // Apply light theme exclusively for the portal
    useEffect(() => {
        document.body.style.backgroundColor = '#FFFFFF';
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    // Auth & Permission Check
    if (!user) return <Navigate to="/login" replace />;

    // Only bounce them if it's finished loading and they truly have no merchant profile
    if (!isLoading && (!merchantData?.isMerchant || !merchantData?.merchant)) {
        return <Navigate to="/dashboard" replace />;
    }

    // Ensure the URL matches their actual store slug
    const { storeSlug } = useParams<{ storeSlug: string }>();
    if (!isLoading && merchantData?.merchant && storeSlug !== merchantData.merchant.slug) {
        return <Navigate to={`/store/${merchantData.merchant.slug}/dashboard`} replace />;
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 font-inter flex">
            {/* Unified Sidebar */}
            <MerchantSidebar isMobileMenuOpen={isMobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen min-w-0 lg:ml-72 bg-white">
                {/* Mobile Header (Hidden on Desktop) */}
                <div className="lg:hidden flex items-center justify-between p-6 border-b border-slate-100 bg-white sticky top-0 z-30">
                    <div className="font-extrabold text-[#0A1128] tracking-tight">Merchant Portal</div>
                    <button
                        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Routing Area */}
                <div className="flex-1 overflow-x-hidden relative">
                    <Routes>
                        <Route path="dashboard" element={<MerchantOverview />} />
                        <Route path="products" element={<MerchantProducts />} />
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
