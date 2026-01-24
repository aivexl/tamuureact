import React, { useEffect, Suspense, lazy, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { ExternalRedirect } from './components/Auth/ExternalRedirect';
import { CORE_FONTS, getGoogleFontsUrl } from './lib/fonts';
import { MainLayout } from './components/Layout/MainLayout';
import { LazyMotion, domMax } from 'framer-motion';
import { PremiumLoader } from './components/ui/PremiumLoader';
import GlobalModal from './components/Shared/GlobalModal';
import { Toaster } from 'react-hot-toast';

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
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminMusicPage = lazy(() => import('./pages/AdminMusicPage').then(m => ({ default: m.AdminMusicPage })));
const DisplayEditorPage = lazy(() => import('./pages/DisplayEditorPage').then(m => ({ default: m.DisplayEditorPage })));
const RemoteTriggerPage = lazy(() => import('./pages/RemoteTriggerPage').then(m => ({ default: m.RemoteTriggerPage })));
const AdminDisplayPreviewPage = lazy(() => import('./pages/AdminDisplayPreviewPage').then(m => ({ default: m.AdminDisplayPreviewPage })));
const GuestScannerPage = lazy(() => import('./pages/GuestScannerPage').then(m => ({ default: m.GuestScannerPage })));
const UpgradePage = lazy(() => import('./pages/UpgradePage').then(m => ({ default: m.UpgradePage })));
const BillingPage = lazy(() => import('./pages/BillingPage').then(m => ({ default: m.BillingPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const RefundPage = lazy(() => import('./pages/RefundPage').then(m => ({ default: m.RefundPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const InactivePage = lazy(() => import('./pages/InactivePage').then(m => ({ default: m.InactivePage })));

const App: React.FC = () => {
    // Memoize domain check to avoid recalculation
    const isAppDomain = useMemo(() => getIsAppDomain(), []);

    useEffect(() => {
        // Optimization: Detect if we are on landing/store or in the heavy app
        // We include /v, /preview, /welcome, /user, and basically anything that isn't the root landing/store
        const path = window.location.pathname;
        const isAppPath = path.startsWith('/editor') ||
            path.startsWith('/admin') ||
            path.startsWith('/onboarding') ||
            path.startsWith('/inactive') ||
            path.startsWith('/tools') ||
            path.startsWith('/guests') ||
            path.startsWith('/profile') ||
            path.startsWith('/user') ||
            path.startsWith('/preview') ||
            path.startsWith('/v') ||
            path.startsWith('/welcome') ||
            path.startsWith('/display') ||
            // Catch-all for slug routes: if it's not root, it's likely an invitation
            (path !== '/' && path !== '/login' && path !== '/signup' && path !== '/invitations');

        // Only inject dynamic stylesheet if we are in the heavy app (editor/admin) or any invitation/preview route
        // Public pages (landing/store) now use the static stylesheet in index.html for 100/100 performance
        if (isAppPath) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            // CTO FIX: Only load CORE_FONTS globally to avoid massive URL overhead
            // Individual fonts for designs are loaded via SmartFontInjector
            import('./lib/fonts').then(({ CORE_FONTS, getGoogleFontsUrl }) => {
                link.href = getGoogleFontsUrl(CORE_FONTS);
                document.head.appendChild(link);
            });
            return () => {
                if (link.parentNode) document.head.removeChild(link);
            };
        }
    }, []);

    return (
        <BrowserRouter>
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
                        {/* ============================================ */}
                        {/* DOMAIN-AWARE ROOT PATH */}
                        {/* ============================================ */}
                        {isAppDomain ? (
                            // App domain: Root redirects to dashboard
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        ) : (
                            // Public domain: Show landing page
                            <Route path="/" element={<MainLayout><LandingPage /></MainLayout>} />
                        )}

                        {/* ============================================ */}
                        {/* PUBLIC ROUTES - Available on both domains */}
                        {/* ============================================ */}

                        {/* Public Store */}
                        <Route path="/invitations" element={<MainLayout><InvitationsStorePage /></MainLayout>} />

                        {/* Preview Routes - Public for sharing */}
                        <Route path="/preview/:slug" element={<PreviewPage />} />
                        <Route path="/v/:slug" element={<PreviewPage />} />

                        {/* Help / Legal (Public) */}
                        <Route path="/terms" element={<MainLayout><TermsPage /></MainLayout>} />
                        <Route path="/privacy" element={<MainLayout><PrivacyPage /></MainLayout>} />
                        <Route path="/refund" element={<MainLayout><RefundPage /></MainLayout>} />
                        <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />
                        <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />

                        {/* Inactive State (Public) */}
                        <Route path="/inactive/:slug" element={<InactivePage />} />

                        {/* ============================================ */}
                        {/* APP ROUTES - Domain Aware Routing */}
                        {/* ============================================ */}
                        {isAppDomain ? (
                            <>
                                {/* Auth Pages (App Domain Only) */}
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/signup" element={<SignupPage />} />
                                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                                {/* App Core Pages */}
                                <Route path="/onboarding" element={<ProtectedRoute><MainLayout><OnboardingPage /></MainLayout></ProtectedRoute>} />
                                <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
                                <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
                                <Route path="/billing" element={<ProtectedRoute><MainLayout><BillingPage /></MainLayout></ProtectedRoute>} />
                                <Route path="/upgrade" element={<ProtectedRoute><MainLayout><UpgradePage /></MainLayout></ProtectedRoute>} />
                                <Route path="/guests" element={<ProtectedRoute><MainLayout><GuestManagementPage /></MainLayout></ProtectedRoute>} />
                                <Route path="/guests/:invitationId" element={<ProtectedRoute><MainLayout><GuestManagementPage /></MainLayout></ProtectedRoute>} />
                                <Route path="/wishes" element={<ProtectedRoute><MainLayout><GuestWishesPage /></MainLayout></ProtectedRoute>} />

                                {/* Admin Routes */}
                                <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboardPage /></ProtectedRoute>} />
                                <Route path="/admin/music" element={<ProtectedRoute requiredRole="admin"><AdminMusicPage /></ProtectedRoute>} />
                                <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsersPage /></ProtectedRoute>} />
                                <Route path="/admin/templates" element={<ProtectedRoute requiredRole="admin"><AdminTemplatesPage /></ProtectedRoute>} />
                                <Route path="/admin/templates/:type" element={<ProtectedRoute requiredRole="admin"><AdminTemplatesPage /></ProtectedRoute>} />

                                {/* Editor Routes */}
                                <Route path="/editor" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
                                <Route path="/editor/:id" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
                                <Route path="/admin/editor/:slug" element={<ProtectedRoute requiredRole="admin"><EditorPage isTemplate={true} /></ProtectedRoute>} />
                                <Route path="/admin/display-editor/:slug" element={<ProtectedRoute requiredRole="admin"><DisplayEditorPage /></ProtectedRoute>} />
                                <Route path="/admin/display/:slug" element={<ProtectedRoute requiredRole="admin"><AdminDisplayPreviewPage /></ProtectedRoute>} />
                                <Route path="/user/editor/:id" element={<ProtectedRoute><UserEditorPage /></ProtectedRoute>} />
                                <Route path="/user/display-editor/:id" element={<ProtectedRoute><UserEditorPage mode="welcome" /></ProtectedRoute>} />

                                {/* Guest Experience */}
                                <Route path="/welcome/:invitationId/:guestId" element={<GuestWelcomePage />} />
                                <Route path="/display/:slug" element={<GuestWelcomeDisplay />} />
                                <Route path="/guests/scan/:id" element={<GuestScannerPage />} />
                            </>
                        ) : (
                            // Public domain (tamuu.id): Redirect all app paths to app.tamuu.id
                            <>
                                {/* Auth Redirects */}
                                <Route path="/login" element={<ExternalRedirect to="https://app.tamuu.id/login" />} />
                                <Route path="/signup" element={<ExternalRedirect to="https://app.tamuu.id/signup" />} />
                                <Route path="/forgot-password" element={<ExternalRedirect to="https://app.tamuu.id/forgot-password" />} />

                                {/* App Page Redirects */}
                                <Route path="/dashboard" element={<ExternalRedirect to="https://app.tamuu.id/dashboard" />} />
                                <Route path="/onboarding" element={<ExternalRedirect to="https://app.tamuu.id/onboarding" />} />
                                <Route path="/profile" element={<ExternalRedirect to="https://app.tamuu.id/profile" />} />
                                <Route path="/billing" element={<ExternalRedirect to="https://app.tamuu.id/billing" />} />
                                <Route path="/upgrade" element={<ExternalRedirect to="https://app.tamuu.id/upgrade" />} />
                                <Route path="/guests/*" element={<ExternalRedirect to="https://app.tamuu.id/guests" />} />
                                <Route path="/admin/*" element={<ExternalRedirect to="https://app.tamuu.id/admin/dashboard" />} />
                                <Route path="/editor/*" element={<ExternalRedirect to="https://app.tamuu.id/dashboard" />} />
                                <Route path="/user/*" element={<ExternalRedirect to="https://app.tamuu.id/dashboard" />} />
                            </>
                        )}

                        {/* 
                            GHOST V4.0: Catch-all Slug Route 
                            MUST be after specific routes to avoid collisions.
                        */}
                        <Route path="/:slug" element={<PreviewPage />} />

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
