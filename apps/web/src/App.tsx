import React, { useEffect, Suspense, lazy, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { CORE_FONTS, getGoogleFontsUrl } from './lib/fonts';
import { MainLayout } from './components/Layout/MainLayout';
import { Loader2 } from 'lucide-react';
import { LazyMotion, domMax } from 'framer-motion';

// ============================================
// DOMAIN DETECTION
// ============================================
// Determines if we're on the app subdomain (app.tamuu.id)
// localhost is treated as app domain for development
const getIsAppDomain = (): boolean => {
    const host = window.location.hostname;
    return host.startsWith('app.') || host === 'localhost' || host === '127.0.0.1';
};

// ============================================
// PAGE IMPORTS
// ============================================
// Eagerly load public pages for instant rendering and better PSI scores
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
const InvitationsStorePage = lazy(() => import('./pages/InvitationsStorePage').then(m => ({ default: m.InvitationsStorePage })));

// Lazy load heavy admin/editor pages (app.tamuu.id only)
const EditorPage = lazy(() => import('./pages/EditorPage').then(m => ({ default: m.EditorPage })));
const AdminTemplatesPage = lazy(() => import('./pages/AdminTemplatesPage').then(m => ({ default: m.AdminTemplatesPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const PreviewPage = lazy(() => import('./pages/PreviewPage').then(m => ({ default: m.PreviewPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const GuestManagementPage = lazy(() => import('./pages/GuestManagementPage').then(m => ({ default: m.GuestManagementPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const UserEditorPage = lazy(() => import('./pages/UserEditorPage').then(m => ({ default: m.UserEditorPage })));
const GuestWishesPage = lazy(() => import('./pages/GuestWishesPage').then(m => ({ default: m.GuestWishesPage })));
const GuestWelcomePage = lazy(() => import('./pages/GuestWelcomePage').then(m => ({ default: m.GuestWelcomePage })));
const GuestWelcomeDisplay = lazy(() => import('./pages/GuestWelcomeDisplay').then(m => ({ default: m.GuestWelcomeDisplay })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminMusicPage = lazy(() => import('./pages/AdminMusicPage').then(m => ({ default: m.AdminMusicPage })));
const DisplayEditorPage = lazy(() => import('./pages/DisplayEditorPage').then(m => ({ default: m.DisplayEditorPage })));
const RemoteTriggerPage = lazy(() => import('./pages/RemoteTriggerPage').then(m => ({ default: m.RemoteTriggerPage })));
const AdminDisplayPreviewPage = lazy(() => import('./pages/AdminDisplayPreviewPage').then(m => ({ default: m.AdminDisplayPreviewPage })));
const GuestScannerPage = lazy(() => import('./pages/GuestScannerPage').then(m => ({ default: m.GuestScannerPage })));
const UpgradePage = lazy(() => import('./pages/UpgradePage').then(m => ({ default: m.UpgradePage })));
const BillingPage = lazy(() => import('./pages/BillingPage').then(m => ({ default: m.BillingPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage }))); import { PremiumLoader } from './components/ui/PremiumLoader';

const App: React.FC = () => {
    // Memoize domain check to avoid recalculation
    const isAppDomain = useMemo(() => getIsAppDomain(), []);

    useEffect(() => {
        // Optimization: Detect if we are on landing/store or in the heavy app
        const isAppPath = window.location.pathname.startsWith('/editor') ||
            window.location.pathname.startsWith('/admin') ||
            window.location.pathname.startsWith('/onboarding') ||
            window.location.pathname.startsWith('/tools') ||
            window.location.pathname.startsWith('/guests') ||
            window.location.pathname.startsWith('/profile');

        // Only inject dynamic stylesheet if we are in the heavy app (editor/admin)
        // Public pages (landing/store) now use the static stylesheet in index.html for 100/100 performance
        if (isAppPath) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = getGoogleFontsUrl();
            document.head.appendChild(link);
            return () => {
                document.head.removeChild(link);
            };
        }
    }, []);

    return (
        <BrowserRouter>
            <LazyMotion features={domMax} strict>
                <Suspense fallback={<PremiumLoader />}>
                    <Routes>
                        {/* ============================================ */}
                        {/* PUBLIC ROUTES - Available on tamuu.id */}
                        {/* ============================================ */}

                        {/* Public Landing */}
                        <Route path="/" element={<MainLayout><LandingPage /></MainLayout>} />

                        {/* Public Store */}
                        <Route path="/invitations" element={<MainLayout><InvitationsStorePage /></MainLayout>} />

                        {/* Public Auth */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                        {/* Preview Routes - Public for sharing */}
                        <Route path="/preview/:slug" element={<PreviewPage />} />
                        <Route path="/upgrade" element={<MainLayout><UpgradePage /></MainLayout>} />
                        <Route path="/billing" element={<MainLayout><BillingPage /></MainLayout>} />
                        <Route path="/terms" element={<MainLayout><TermsPage /></MainLayout>} />
                        <Route path="/privacy" element={<MainLayout><PrivacyPage /></MainLayout>} />

                        {/* ============================================ */}
                        {/* APP ROUTES - Protected */}
                        {/* ============================================ */}
                        <Route path="/onboarding" element={<ProtectedRoute><MainLayout><OnboardingPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
                        <Route path="/billing" element={<ProtectedRoute><MainLayout><BillingPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/upgrade" element={<ProtectedRoute><MainLayout><UpgradePage /></MainLayout></ProtectedRoute>} />
                        <Route path="/guests" element={<ProtectedRoute><MainLayout><GuestManagementPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/guests/:invitationId" element={<ProtectedRoute><MainLayout><GuestManagementPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/wishes" element={<ProtectedRoute><MainLayout><GuestWishesPage /></MainLayout></ProtectedRoute>} />

                        {/* ============================================ */}
                        {/* APP ROUTES - Guarded by Domain/Auth logic in components if needed */}
                        {/* ============================================ */}
                        {isAppDomain ? (
                            <>
                                {/* Admin Routes */}
                                <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboardPage /></ProtectedRoute>} />
                                <Route path="/admin/music" element={<ProtectedRoute requiredRole="admin"><AdminMusicPage /></ProtectedRoute>} />
                                <Route path="/admin/templates" element={<ProtectedRoute requiredRole="admin"><AdminTemplatesPage /></ProtectedRoute>} />

                                {/* Editor Routes */}
                                <Route path="/editor" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
                                <Route path="/editor/:id" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
                                <Route path="/admin/editor/:slug" element={<ProtectedRoute requiredRole="admin"><EditorPage isTemplate={true} /></ProtectedRoute>} />
                                <Route path="/admin/display-editor/:slug" element={<ProtectedRoute requiredRole="admin"><DisplayEditorPage /></ProtectedRoute>} />
                                <Route path="/admin/display/:slug" element={<ProtectedRoute requiredRole="admin"><AdminDisplayPreviewPage /></ProtectedRoute>} />
                                <Route path="/user/editor/:id" element={<UserEditorPage />} />
                                <Route path="/user/display-editor/:id" element={<UserEditorPage mode="welcome" />} />

                                {/* Onboarding & Guest Management */}
                                <Route path="/welcome/:invitationId/:guestId" element={<GuestWelcomePage />} />
                                <Route path="/display/:slug" element={<GuestWelcomeDisplay />} />
                                <Route path="/guests/scan/:id" element={<GuestScannerPage />} />
                            </>

                        ) : (
                            // Public domain specific fallbacks/redirects
                            <>
                                <Route path="/admin/*" element={<Navigate to="/" replace />} />
                                <Route path="/editor/*" element={<Navigate to="/" replace />} />
                                <Route path="/user/*" element={<Navigate to="/" replace />} />
                            </>
                        )}

                        <Route path="/display/:slug" element={<GuestWelcomeDisplay />} />
                        <Route path="/remote/:id" element={<RemoteTriggerPage />} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </LazyMotion>
        </BrowserRouter>
    );
};

export default App;
