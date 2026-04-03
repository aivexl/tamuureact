import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { MainLayout } from './components/Layout/MainLayout';
import { LazyMotion, domMax } from 'framer-motion';
import { PremiumLoader } from './components/ui/PremiumLoader';
import GlobalModal from './components/Shared/GlobalModal';
import { Toaster } from 'react-hot-toast';

// ============================================
// PAGE IMPORTS
// ============================================
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
const InvitationsStorePage = lazy(() => import('./pages/InvitationsStorePage').then(m => ({ default: m.InvitationsStorePage })));
const EditorPage = lazy(() => import('./pages/EditorPage').then(m => ({ default: m.EditorPage })));
const AdminTemplatesPage = lazy(() => import('./pages/AdminTemplatesPage').then(m => ({ default: m.AdminTemplatesPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const PreviewPage = lazy(() => import('./pages/PreviewPage').then(m => ({ default: m.PreviewPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const GuestManagementPage = lazy(() => import('./pages/GuestManagementPage').then(m => ({ default: m.GuestManagementPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const UserEditorPage = lazy(() => import('./pages/UserEditorPage').then(m => ({ default: m.UserEditorPage })));
const GuestWishesPage = lazy(() => import('./pages/GuestWishesPage').then(m => ({ default: m.GuestWishesPage })));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminTransactionsPage = lazy(() => import('./pages/AdminTransactionsPage').then(m => ({ default: m.AdminTransactionsPage })));
const AdminActivityPage = lazy(() => import('./pages/AdminActivityPage').then(m => ({ default: m.AdminActivityPage })));
const AdminMusicPage = lazy(() => import('./pages/AdminMusicPage').then(m => ({ default: m.AdminMusicPage })));
const RemoteTriggerPage = lazy(() => import('./pages/RemoteTriggerPage').then(m => ({ default: m.RemoteTriggerPage })));
const GuestScannerPage = lazy(() => import('./pages/GuestScannerPage').then(m => ({ default: m.GuestScannerPage })));
const UpgradePage = lazy(() => import('./pages/UpgradePage').then(m => ({ default: m.UpgradePage })));
const BillingPage = lazy(() => import('./pages/BillingPage').then(m => ({ default: m.BillingPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const RefundPage = lazy(() => import('./pages/RefundPage').then(m => ({ default: m.RefundPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const InactivePage = lazy(() => import('./pages/InactivePage').then(m => ({ default: m.InactivePage })));
const BlogRouter = lazy(() => import('./pages/blog/BlogRouter'));
const AdminBlogListPage = lazy(() => import('./pages/blog/AdminBlogListPage').then(m => ({ default: m.AdminBlogListPage })));
const AdminBlogEditor = lazy(() => import('./pages/blog/AdminBlogEditor').then(m => ({ default: m.AdminBlogEditor })));
const AdminShopSettingsPage = lazy(() => import('./pages/Admin/AdminShopSettingsPage').then(m => ({ default: m.AdminShopSettingsPage })));
const AdminStoreManagementPage = lazy(() => import('./pages/Admin/AdminStoreManagementPage').then(m => ({ default: m.AdminStoreManagementPage })));
const AdminProductsPage = lazy(() => import('./pages/Admin/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })));
const AdminProductListingPage = lazy(() => import('./pages/Admin/AdminProductListingPage').then(m => ({ default: m.AdminProductListingPage })));
const AdminReportsPage = lazy(() => import('./pages/Admin/AdminReportsPage').then(m => ({ default: m.AdminReportsPage })));
const AdminAdsPage = lazy(() => import('./pages/Admin/AdminAdsPage').then(m => ({ default: m.AdminAdsPage })));
const AdminFeedbackPage = lazy(() => import('./pages/AdminFeedbackPage').then(m => ({ default: m.AdminFeedbackPage })));
const AdminPushNotificationPage = lazy(() => import('./pages/Admin/AdminPushNotificationPage').then(m => ({ default: m.AdminPushNotificationPage })));
const AdminChatMonitoringPage = lazy(() => import('./pages/Admin/AdminChatMonitoringPage').then(m => ({ default: m.AdminChatMonitoringPage })));

// Shop & Vendor Pages
const VendorPortalPage = lazy(() => import('./pages/Vendor/VendorPortalPage').then(m => ({ default: m.VendorPortalPage })));
const VendorOnboardingPage = lazy(() => import('./pages/Vendor/VendorOnboardingPage').then(m => ({ default: m.VendorOnboardingPage })));
const ShopPage = lazy(() => import('./pages/Shop/ShopPage'));
const StorefrontPage = lazy(() => import('./pages/Shop/StorefrontPage'));
const ProductDetailPage = lazy(() => import('./pages/Shop/ProductDetailPage'));
const GuestWelcomeDisplay = lazy(() => import('./pages/GuestWelcomeDisplay').then(m => ({ default: m.GuestWelcomeDisplay })));
const GuestWelcomePage = lazy(() => import('./pages/GuestWelcomePage').then(m => ({ default: m.GuestWelcomePage })));

import { usePushNotifications } from './hooks/usePushNotifications';
import { useStore } from './store/useStore';

// ============================================
// AUTH SYNC COMPONENT (Next.js -> Vite)
// ============================================
const AuthSync: React.FC = () => {
    const { setAuthSession, isAuthenticated, isLoading } = useStore();

    useEffect(() => {
        // Only sync if not already authenticated and not loading
        if (!isAuthenticated) {
            try {
                const userData = localStorage.getItem('tamuu_user');
                const token = localStorage.getItem('tamuu_token');

                if (userData && token) {
                    const user = JSON.parse(userData);
                    console.log('[Auth Sync] Found Next.js session in localStorage, syncing to Vite store:', user.email);
                    setAuthSession({ user, token });
                }
            } catch (err) {
                console.error('[Auth Sync] Failed to parse Next.js session:', err);
            }
        }
    }, [isAuthenticated, setAuthSession]);

    return null;
};

const App: React.FC = () => {
    const { subscribe, permission } = usePushNotifications();

    useEffect(() => {
        console.log("Tamuu v2.0.4-passive");
        if (permission === 'default') {
            const timer = setTimeout(() => { subscribe(); }, 2000);
            return () => clearTimeout(timer);
        }
    }, [permission, subscribe]);

    return (
        <BrowserRouter>
            <AuthSync />
            <LazyMotion features={domMax} strict>
                <Suspense fallback={<PremiumLoader />}>
                    <GlobalModal />
                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            style: {
                                background: '#111',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                fontSize: '13px',
                                fontWeight: 'bold'
                            }
                        }}
                    />
                    <Routes>
                        {/* 
                            PASSIVE ROUTING:
                            The Next.js Worker on app.tamuu.id and tamuu.id handles the primary routing.
                            This Vite app is served as a fallback or for specific legacy paths.
                        */}
                        
                        {/* Auth Pages (Passive) */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                        {/* Public Shop & Content */}
                        <Route path="/invitations" element={<MainLayout><InvitationsStorePage /></MainLayout>} />
                        <Route path="/blog/*" element={<MainLayout><BlogRouter /></MainLayout>} />
                        <Route path="/shop/:slug" element={<StorefrontPage />} />
                        <Route path="/shop/:slug/:productId" element={<ProductDetailPage />} />
                        
                        {/* Preview Routes */}
                        <Route path="/preview/:slug" element={<PreviewPage />} />
                        <Route path="/v/:slug" element={<PreviewPage />} />

                        {/* App Core (Passive) */}
                        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/onboarding" element={<ProtectedRoute><MainLayout><OnboardingPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
                        <Route path="/billing" element={<ProtectedRoute><MainLayout><BillingPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/upgrade" element={<ProtectedRoute><MainLayout><UpgradePage /></MainLayout></ProtectedRoute>} />
                        <Route path="/guests" element={<ProtectedRoute><MainLayout><GuestManagementPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/wishes" element={<ProtectedRoute><MainLayout><GuestWishesPage /></MainLayout></ProtectedRoute>} />

                        {/* Admin Routes */}
                        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboardPage /></ProtectedRoute>} />
                        <Route path="/admin/music" element={<ProtectedRoute requiredRole="admin"><AdminMusicPage /></ProtectedRoute>} />
                        <Route path="/admin/admins" element={<ProtectedRoute requiredRole="admin"><AdminUsersPage role="admin" /></ProtectedRoute>} />
                        <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsersPage role="user" /></ProtectedRoute>} />
                        <Route path="/admin/transactions" element={<ProtectedRoute requiredRole="admin"><AdminTransactionsPage /></ProtectedRoute>} />
                        <Route path="/admin/activity" element={<ProtectedRoute requiredRole="admin"><AdminActivityPage /></ProtectedRoute>} />
                        <Route path="/admin/templates" element={<ProtectedRoute requiredRole="admin"><AdminTemplatesPage /></ProtectedRoute>} />
                        <Route path="/admin/stores" element={<ProtectedRoute requiredRole="admin"><AdminStoreManagementPage /></ProtectedRoute>} />
                        <Route path="/admin/products" element={<ProtectedRoute requiredRole="admin"><AdminProductsPage /></ProtectedRoute>} />
                        <Route path="/admin/blog" element={<ProtectedRoute requiredRole="admin"><AdminBlogListPage /></ProtectedRoute>} />

                        {/* Editor Routes */}
                        <Route path="/editor" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
                        <Route path="/editor/:id" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
                        <Route path="/user/editor/:id" element={<ProtectedRoute><UserEditorPage /></ProtectedRoute>} />

                        {/* Vendor Portal */}
                        <Route path="/vendor/onboarding" element={<ProtectedRoute><VendorOnboardingPage /></ProtectedRoute>} />
                        <Route path="/vendor/:storeSlug/*" element={<ProtectedRoute><VendorPortalPage /></ProtectedRoute>} />

                        {/* Legal & Static */}
                        <Route path="/terms" element={<MainLayout><TermsPage /></MainLayout>} />
                        <Route path="/privacy" element={<MainLayout><PrivacyPage /></MainLayout>} />
                        <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />

                        {/* Dynamic Slugs (Lowest Priority) */}
                        <Route path="/:slug" element={<PreviewPage />} />
                        <Route path="/:slug/:guestSlug" element={<PreviewPage />} />
                        
                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </LazyMotion>
        </BrowserRouter>
    );
};

export default App;
