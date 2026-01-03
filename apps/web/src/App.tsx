import React, { useEffect, Suspense, lazy, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CORE_FONTS, getGoogleFontsUrl } from './lib/fonts';
import { MainLayout } from './components/Layout/MainLayout';
import { Loader2 } from 'lucide-react';
import { LazyMotion, domAnimation } from 'framer-motion';

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
const InvitationsStorePage = lazy(() => import('./pages/InvitationsStorePage').then(m => ({ default: m.InvitationsStorePage })));

// Lazy load heavy admin/editor pages (app.tamuu.id only)
const EditorPage = lazy(() => import('./pages/EditorPage').then(m => ({ default: m.EditorPage })));
const AdminTemplatesPage = lazy(() => import('./pages/AdminTemplatesPage').then(m => ({ default: m.AdminTemplatesPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const BackgroundRemoverPage = lazy(() => import('./pages/BackgroundRemoverPage').then(m => ({ default: m.BackgroundRemoverPage })));
const PreviewPage = lazy(() => import('./pages/PreviewPage').then(m => ({ default: m.PreviewPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const GuestManagementPage = lazy(() => import('./pages/GuestManagementPage').then(m => ({ default: m.GuestManagementPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const UserEditorPage = lazy(() => import('./pages/UserEditorPage').then(m => ({ default: m.UserEditorPage })));

const LoadingFallback = () => (
    <div className="min-h-screen bg-[#0A1128] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-[#FFBF00] animate-spin" />
        <p className="text-white/20 uppercase tracking-widest text-xs font-bold">Loading Tamuu...</p>
    </div>
);

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
            <LazyMotion features={domAnimation} strict>
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        {/* ============================================ */}
                        {/* PUBLIC ROUTES - Available on tamuu.id */}
                        {/* ============================================ */}

                        {/* Public Landing */}
                        <Route path="/" element={<MainLayout><LandingPage /></MainLayout>} />

                        {/* Public Store */}
                        <Route path="/invitations" element={<MainLayout><InvitationsStorePage /></MainLayout>} />

                        {/* Preview Routes - Public for sharing */}
                        <Route path="/preview/:slug" element={<PreviewPage />} />

                        {/* ============================================ */}
                        {/* APP ROUTES - Only on app.tamuu.id */}
                        {/* ============================================ */}
                        {isAppDomain ? (
                            <>
                                {/* User Profile */}
                                <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />

                                {/* Dashboard */}
                                <Route path="/dashboard" element={<MainLayout><DashboardPage /></MainLayout>} />
                                <Route path="/admin/dashboard" element={<MainLayout><DashboardPage /></MainLayout>} />

                                {/* Editor Routes */}
                                <Route path="/editor" element={<EditorPage />} />
                                <Route path="/editor/:id" element={<EditorPage />} />
                                <Route path="/editor/template/:id" element={<EditorPage isTemplate={true} />} />
                                <Route path="/user/editor/:id" element={<UserEditorPage />} />

                                {/* Admin Routes */}
                                <Route path="/admin/templates" element={<MainLayout><AdminTemplatesPage /></MainLayout>} />

                                {/* Tools */}
                                <Route path="/tools/background-remover" element={<MainLayout><BackgroundRemoverPage /></MainLayout>} />

                                {/* Onboarding & Guest Management */}
                                <Route path="/onboarding" element={<MainLayout><OnboardingPage /></MainLayout>} />
                                <Route path="/guests" element={<MainLayout><GuestManagementPage /></MainLayout>} />
                                <Route path="/guests/:invitationId" element={<MainLayout><GuestManagementPage /></MainLayout>} />
                            </>
                        ) : (
                            // Redirect app routes to landing on public domain
                            <>
                                <Route path="/profile" element={<Navigate to="/" replace />} />
                                <Route path="/admin/*" element={<Navigate to="/" replace />} />
                                <Route path="/editor/*" element={<Navigate to="/" replace />} />
                                <Route path="/user/*" element={<Navigate to="/" replace />} />
                                <Route path="/tools/*" element={<Navigate to="/" replace />} />
                            </>
                        )}

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </LazyMotion>
        </BrowserRouter>
    );
};

export default App;
