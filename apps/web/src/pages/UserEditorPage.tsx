import React, { useEffect, useState, useMemo } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { UserEditorLayout } from '../components/Layout/UserEditorLayout';
import { EditorLayout } from '@/components/Layout/EditorLayout';
import { IconGridMenu } from '../components/UserEditor/IconGridMenu';
import { TemplateEditArea } from '../components/UserEditor/TemplateEditArea';
import { InvitationInfoCard } from '../components/UserEditor/InvitationInfoCard';
import { Modal } from '@/components/ui/Modal';
import { MusicPanel } from '@/components/UserEditor/Panels/MusicPanel';
import { PremiumLoader } from '../components/ui/PremiumLoader';

import { SharePanel } from '@/components/UserEditor/Panels/SharePanel';
import { ExportPanel } from '@/components/UserEditor/Panels/ExportPanel';
import { OrbitPanel } from '@/components/UserEditor/Panels/OrbitPanel';
import { TemplateStorePanel } from '@/components/UserEditor/Panels/TemplateStorePanel';
import { SmartFontInjector } from '@/components/ui/SmartFontInjector';
import { DisplayStorePanel } from '@/components/UserEditor/Panels/DisplayStorePanel';
import { WishesPanel } from '@/components/UserEditor/Panels/WishesPanel';
import { AnalyticsPanel } from '@/components/UserEditor/Panels/AnalyticsPanel';
import { EventDatePanel } from '@/components/UserEditor/Panels/EventDatePanel';
import { LocationPanel } from '@/components/UserEditor/Panels/LocationPanel';
import { GiftPanel } from '@/components/UserEditor/Panels/GiftPanel';
import { SEOPanel } from '@/components/UserEditor/Panels/SEOPanel';
import { GalleryPanel } from '@/components/UserEditor/Panels/GalleryPanel';
import { LiveStreamPanel } from '@/components/UserEditor/Panels/LiveStreamPanel';
import { LuckyDrawPanel } from '@/components/UserEditor/Panels/LuckyDrawPanel';
import { SettingsPanel } from '@/components/UserEditor/Panels/SettingsPanel';
import { LoveStoryPanel } from '@/components/UserEditor/Panels/LoveStoryPanel';
import { QuotesPanel } from '@/components/UserEditor/Panels/QuotesPanel';
import { ProfilePhotoPanel } from '@/components/UserEditor/Panels/ProfilePhotoPanel';
import { AnimatedLayer } from '@/components/Preview/AnimatedLayer';
import { useStore } from '@/store/useStore';
import { invitations as invitationsApi } from '@/lib/api';
import { Sparkles, AlertCircle, Clock, ChevronRight, X, Info, Layout as LayoutIcon, Eye } from 'lucide-react';
import { useRef } from 'react';
import { useSubscriptionTimer } from '../hooks/useSubscriptionTimer';


import { SubscriptionStatusWidget } from '../components/ui/SubscriptionStatusWidget';

// ============================================
// TUTORIAL SYSTEM (INDONESIAN)
// ============================================

const TUTORIAL_STEPS = [
    {
        targetId: 'tutorial-info-card',
        title: 'Selamat Datang!',
        description: 'Ini adalah kartu informasi undangan Anda. Di sini Anda bisa melihat link undangan, mengubah status ke Publish/Draft, dan mengatur link sosmed.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-menu',
        title: 'Menu Fitur Cepat',
        description: 'Gunakan tombol-tombol ini untuk mengatur fitur spesifik seperti Musik, Tamu, Ucapan, Galeri, dan lainnya dengan cepat.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-template-area',
        title: 'Area Edit Konten',
        description: 'Di sini adalah tempat utama Anda mengelola isi undangan. Konten dibagi menjadi beberapa bagian (Section) yang bisa Anda atur.',
        position: 'top'
    },
    {
        targetId: 'tutorial-section-expand',
        title: 'Buka Bagian',
        description: 'Klik ikon kotak ini untuk membuka isi dari bagian tersebut. Anda bisa mengubah teks, gambar, dan warna di dalamnya.',
        position: 'right'
    },
    {
        targetId: 'tutorial-section-visible',
        title: 'Tampilkan/Sembunyikan',
        description: 'Gunakan ikon mata ini jika Anda ingin menyembunyikan atau menampilkan bagian tertentu di undangan Anda.',
        position: 'left'
    }
];

const TutorialOverlay = ({ onComplete }: { onComplete: () => void }) => {
    const [step, setStep] = useState(0);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const currentStep = TUTORIAL_STEPS[step];

    useEffect(() => {
        const updateCoords = () => {
            const el = document.getElementById(currentStep.targetId);
            if (el) {
                const rect = el.getBoundingClientRect();
                setCoords({
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height
                });
                
                // Smooth scroll to element
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };

        // Delay initial coords to ensure layout has settled
        const timer = setTimeout(updateCoords, 500);
        
        window.addEventListener('resize', updateCoords);
        window.addEventListener('scroll', updateCoords);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateCoords);
            window.removeEventListener('scroll', updateCoords);
        };
    }, [step, currentStep.targetId]);

    const handleNext = () => {
        if (step < TUTORIAL_STEPS.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Backdrop with Hole */}
            <m.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] pointer-events-auto"
                style={{
                    clipPath: `polygon(0% 0%, 0% 100%, ${coords.left}px 100%, ${coords.left}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top + coords.height}px, ${coords.left}px ${coords.top + coords.height}px, ${coords.left}px 100%, 100% 100%, 100% 0%)`
                }}
            />

            {/* Tutorial Card */}
            <AnimatePresence mode="wait">
                <m.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        y: 0,
                        top: currentStep.position === 'bottom' ? coords.top + coords.height + 20 : (currentStep.position === 'top' ? coords.top - 220 : coords.top + (coords.height / 2) - 100),
                        left: currentStep.position === 'right' ? coords.left + coords.width + 20 : (currentStep.position === 'left' ? coords.left - 320 : coords.left + (coords.width/2) - 150)
                    }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute w-[300px] bg-white rounded-3xl shadow-2xl p-6 pointer-events-auto border border-slate-100 z-[101]"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            {step === 0 ? <Sparkles className="w-5 h-5" /> : step === 1 ? <Info className="w-5 h-5" /> : step === 2 ? <LayoutIcon className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </div>
                        <button onClick={onComplete} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <h4 className="text-lg font-black text-slate-900 tracking-tight mb-2 uppercase tracking-widest">{currentStep.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6 font-medium">
                        {currentStep.description}
                    </p>

                    <div className="flex items-center justify-between gap-3">
                        <button 
                            onClick={onComplete}
                            className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                        >
                            Skip
                        </button>
                        
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1 mr-2">
                                {TUTORIAL_STEPS.map((_, i) => (
                                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? 'bg-indigo-600 w-4' : 'bg-slate-200'}`} />
                                ))}
                            </div>
                            <button
                                onClick={handleNext}
                                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
                            >
                                {step === TUTORIAL_STEPS.length - 1 ? 'Selesai' : 'Next'}
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    {/* Arrow Pointer */}
                    <div 
                        className={`absolute w-4 h-4 bg-white rotate-45 border-slate-100 ${
                            currentStep.position === 'bottom' ? '-top-2 left-1/2 -translate-x-1/2 border-t border-l' :
                            currentStep.position === 'top' ? '-bottom-2 left-1/2 -translate-x-1/2 border-b border-r' :
                            currentStep.position === 'right' ? 'top-1/2 -left-2 -translate-y-1/2 border-b border-l' :
                            'top-1/2 -right-2 -translate-y-1/2 border-t border-r'
                        }`}
                    />
                </m.div>
            </AnimatePresence>
        </div>
    );
};

interface UserEditorPageProps {
    mode?: 'invitation' | 'welcome';
}

export const UserEditorPage: React.FC<UserEditorPageProps> = ({ mode = 'invitation' }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    // 1. PROJECT IDENTIFIERS
    const currentStoredId = useStore(s => s.id);
    const hasHydrated = useStore(s => s.hasHydrated);

    // 2. ATOMIC SETTERS
    const resetStore = useStore(s => s.resetStore);
    const resetSections = useStore(s => s.resetSections);
    const clearLayers = useStore(s => s.clearLayers);
    const hydrateProject = useStore(s => s.hydrateProject);
    const setSections = useStore(s => s.setSections);
    const setOrbitLayers = useStore(s => s.setOrbitLayers);
    const setActiveSection = useStore(s => s.setActiveSection);

    // 3. UI STATE
    const activeSectionId = useStore(s => s.activeSectionId);
    const sections = useStore(s => s.sections);
    const orbit = useStore(s => s.orbit);
    const exportFormat = useStore(s => s.exportFormat);
    const isPublished = useStore(s => s.isPublished);

    if (mode === 'welcome') {
        return (
            <div className="w-full h-screen bg-[#050505] text-white selection:bg-premium-accent selection:text-premium-dark overflow-hidden font-outfit">
                <EditorLayout templateId={id} isTemplate={false} isDisplayDesign={true} />
            </div>
        );
    }

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [invitation, setInvitation] = useState<any>(null);
    const [showTutorial, setShowTutorial] = useState(false);

    const user = useStore(s => s.user);
    // CTO POLICY: Use invitation-level expiry for status if available, fallback to user
    const subStatus = useSubscriptionTimer(invitation?.expires_at || user?.expiresAt || null);
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const hasAttemptedRef = useRef<string | null>(null);

    useEffect(() => {
        const loadInvitation = async () => {
            if (!id || hasAttemptedRef.current === id) return;
            hasAttemptedRef.current = id;

            console.log('[UserEditor] [v3.8-BILLIONAIRE] Starting atomic load for:', id);

            setLoading(true);
            setError(null);

            // 1. ID GUARD: Atomic check before any state changes
            if (hasHydrated && currentStoredId !== id) {
                console.log('[UserEditor] ID Sync: Wiping stale data (', currentStoredId, '->', id, ')');
                resetStore();
                resetSections();
                clearLayers();
            }

            try {
                const data = await invitationsApi.get(id);

                // CTO: Smart Transactional Hydration
                // We no longer force all permissions to true. 
                // We respect the template's granular settings.
                hydrateProject(data);

                // Deep arrays still need individual syncs if they are handled by separate slices
                setSections(data.sections || []);
                if (data.orbit_layers) setOrbitLayers(data.orbit_layers);

                // 3. UI Sync (Local Component State)
                setInvitation({
                    id: data.id,
                    title: data.name,
                    slug: data.slug,
                    is_published: !!data.is_published,
                    status: data.is_published ? "Published" : "Draft",
                    thumbnailUrl: data.thumbnail_url,
                    category: data.category
                });

                if (data.sections?.length > 0 && !activeSectionId) {
                    setActiveSection(data.sections[0].id);
                }

                console.log('[UserEditor] Hydration Successful. Engine Online.');

                // Check if tutorial should be shown
                const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${id}`);
                if (!hasSeenTutorial) {
                    setTimeout(() => setShowTutorial(true), 1500);
                }
            } catch (err) {
                console.error('[UserEditor] Hydration Failed:', err);
                setError('Undangan tidak ditemukan atau terjadi kesalahan.');
                hasAttemptedRef.current = null; // Allow retry
            } finally {
                setLoading(false);
            }
        };

        if (hasHydrated) {
            loadInvitation();
        }
    }, [id, hasHydrated]); // MINIMAL DEPS: Only ID and Hydration status matter. Setters are stable.

    const completeTutorial = () => {
        setShowTutorial(false);
        localStorage.setItem(`tutorial_seen_${id}`, 'true');
    };

    if (loading) {
        return <PremiumLoader showLabel label="Menyiapkan Editor Anda..." />;
    }

    if (error || !invitation) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <p className="text-slate-600 font-medium">{error || 'Undangan tidak ditemukan'}</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                    Kembali ke Dashboard
                </button>
            </div>
        );
    }



    return (
        <UserEditorLayout>
            <SmartFontInjector />
            <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* 1. Information Card */}
                <InvitationInfoCard
                    invitation={{
                        ...invitation,
                        is_published: isPublished,
                        status: isPublished ? "Published" : "Draft"
                    }}
                    onShare={() => setActivePanel('share')}
                    onSettings={() => setActivePanel('settings')}
                />

                {/* 2. Feature Menu */}
                <IconGridMenu onOpenPanel={(panelId: string) => {
                    console.log('[UserEditor] Opening panel:', panelId);
                    if (panelId === 'guests') {
                        // Force a clean load for Guest Management to avoid editor state pollution
                        window.location.href = `/guests/${id}`;
                    } else {
                        setActivePanel(panelId);
                    }
                }} />


                {/* 4. Main Edit Area */}
                <TemplateEditArea />
            </div>

            {/* Tutorial Overlay */}
            {showTutorial && <TutorialOverlay onComplete={completeTutorial} />}

            {/* Panels Modal - MOVED OUTSIDE ANIMATED CONTAINER FOR STACKING CONTEXT PURITY */}
            <Modal
                isOpen={activePanel !== null}
                onClose={() => setActivePanel(null)}
                title={(() => {
                    const titles: Record<string, string> = {
                        theme: 'Tema Undangan',
                        music: 'Musik Latar',
                        template: 'Koleksi Template',
                        wishes: 'Ucapan & Doa',
                        display: 'Display Desain',
                        analytics: 'Statistik & Analitik',
                        share: 'Bagikan Undangan',
                        download: 'Download Assets',
                        eventDate: 'Tanggal Acara',
                        location: 'Lokasi Acara',
                        gift: 'Kado Digital',
                        seo: 'Sosmed Preview',
                        gallery: 'Galeri Foto',
                        livestream: 'Live Streaming',
                        lovestory: 'Kisah Cinta',
                        quotes: 'Quote Undangan',
                        luckydraw: 'Lucky Draw',
                        settings: 'Pengaturan Undangan',
                        profile_photo: 'Foto Profil'
                    };
                    return titles[activePanel || ''] || (activePanel ? activePanel.charAt(0).toUpperCase() + activePanel.slice(1) : '');
                })()}
                size="lg"
            >
                {activePanel === 'music' && <MusicPanel />}

                {activePanel === 'display' && <DisplayStorePanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'template' && <TemplateStorePanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'wishes' && <WishesPanel />}
                {activePanel === 'analytics' && <AnalyticsPanel />}
                {activePanel === 'share' && <SharePanel slug={invitation?.slug} />}
                {activePanel === 'download' && <ExportPanel previewRef={previewRef as React.RefObject<HTMLElement>} />}
                {activePanel === 'seo' && <SEOPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'gallery' && <GalleryPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'livestream' && <LiveStreamPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'luckydraw' && <LuckyDrawPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'eventDate' && <EventDatePanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'location' && <LocationPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'gift' && <GiftPanel onClose={() => setActivePanel(null)} />}
                {activePanel === 'lovestory' && <LoveStoryPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'quotes' && <QuotesPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'profile_photo' && <ProfilePhotoPanel invitationId={invitation?.id} onClose={() => setActivePanel(null)} />}
                {activePanel === 'settings' && (
                    <SettingsPanel
                        invitationId={invitation?.id}
                        invitation={invitation}
                        onClose={() => setActivePanel(null)}
                        onUpdated={(updates) => setInvitation((prev: any) => ({ ...prev, ...updates }))}
                    />
                )}
                {!['music', 'theme', 'display', 'template', 'share', 'download', 'wishes', 'analytics', 'seo', 'gallery', 'livestream', 'luckydraw', 'settings', 'guests', 'eventDate', 'location', 'gift', 'lovestory', 'quotes', 'profile_photo'].includes(activePanel || '') && (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300">
                            <Sparkles className="w-10 h-10" />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-800 tracking-tight text-xl uppercase tracking-widest">Segera Hadir</h4>
                            <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">Fitur <span className="text-teal-600 font-bold">{activePanel?.toUpperCase()}</span> sedang dalam tahap pengembangan premium.</p>
                        </div>
                        <button onClick={() => setActivePanel(null)} className="px-8 py-3 bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">
                            Tutup
                        </button>
                    </div>
                )}
            </Modal>

            {/* HIDDEN EXPORT PREVIEW (Liquid Parity Engine) */}
            {exportFormat && (() => {

                // DESIGN SETTINGS
                const isDesktop = exportFormat === 'desktop';
                const EXPORT_WIDTH = isDesktop ? 1080 : 414;
                const DESIGN_HEIGHT = 896;
                const DESIGN_WIDTH = 414;

                // DYNAMIC COVER HEIGHT (Matches PreviewView logic)
                // For Mobile export, we use a fixed 960 design units ratio (approx 9:21)
                // to match modern "Tall" screens and avoid squishing.
                let formatRatio = 2500 / 1080; // 9:20.8 (approx 960 design units)
                if (exportFormat === 'desktop') formatRatio = 720 / 1280;
                else if (exportFormat === 'print') formatRatio = 1123 / 794;

                const exportCoverHeight = DESIGN_WIDTH * formatRatio;

                let cumulativeTop = 0;

                return (
                    <div className="fixed -left-[20000px] top-0 pointer-events-none overflow-hidden bg-black flex justify-start items-start" style={{ width: EXPORT_WIDTH, textAlign: 'left' }}>
                        <div
                            ref={previewRef}
                            className="relative bg-[#0a0a0a]"
                            style={{
                                width: EXPORT_WIDTH,
                                height: 'auto',
                                textAlign: 'left'
                            }}
                        >
                            {sections.map((section, sectionIdx) => {
                                const isPortrait = exportFormat === 'mobile' || exportFormat === 'print';
                                const currentSectionHeight = isPortrait ? exportCoverHeight : DESIGN_HEIGHT;
                                const sectionTop = cumulativeTop;
                                cumulativeTop += currentSectionHeight;

                                const extraHeight = currentSectionHeight - DESIGN_HEIGHT;

                                return (
                                    <div
                                        key={`export-section-${section.id}`}
                                        className="relative overflow-hidden"
                                        style={{
                                            width: EXPORT_WIDTH,
                                            height: currentSectionHeight,
                                            top: 0, // Natural stacking is fine as we use a wrapper, or we can use absolute
                                            backgroundColor: section.backgroundColor || '#0a0a0a',
                                            backgroundImage: section.backgroundUrl ? `url(${section.backgroundUrl})` : 'none',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                        }}
                                    >
                                        {/* ORBIT WINGS (Desktop Only) */}
                                        {isDesktop && (
                                            <>
                                                {orbit?.left?.isVisible && orbit.left.elements?.map(element => (
                                                    <AnimatedLayer
                                                        key={`export-orbit-l-${element.id}-${sectionIdx}`}
                                                        layer={element}
                                                        adjustedY={element.y}
                                                        isOpened={true}
                                                        isExportMode={true}
                                                        forceTrigger={true}
                                                    />
                                                ))}

                                                {orbit?.right?.isVisible && orbit.right.elements?.map(element => (
                                                    <div
                                                        key={`export-orbit-r-wrap-${element.id}-${sectionIdx}`}
                                                        className="absolute top-0 right-0 h-full"
                                                        style={{ width: 800 }}
                                                    >
                                                        <AnimatedLayer
                                                            layer={element}
                                                            adjustedY={element.y}
                                                            isOpened={true}
                                                            isExportMode={true}
                                                            forceTrigger={true}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        )}

                                        {/* CORE INVITATION CONTENT (Centered in 1080px if Desktop, Full in 414px if Mobile) */}
                                        <div
                                            className="absolute"
                                            style={{
                                                left: isDesktop ? '50%' : 0,
                                                marginLeft: isDesktop ? -207 : 0,
                                                width: 414,
                                                height: currentSectionHeight,
                                                top: 0
                                            }}
                                        >
                                            {section.elements?.map(element => {
                                                // LIQUID STRETCH PARITY ENGINE
                                                const elAny = element as any;
                                                const elementHeight = element.height || elAny.size?.height || (elAny.textStyle?.fontSize) || 0;
                                                const maxTop = DESIGN_HEIGHT - elementHeight;

                                                let progress = maxTop > 0 ? element.y / maxTop : 0;
                                                progress = Math.max(0, Math.min(1, progress));

                                                const adjustedY = element.y + (extraHeight * progress);

                                                return (
                                                    <AnimatedLayer
                                                        key={`export-el-${element.id}`}
                                                        layer={element}
                                                        adjustedY={adjustedY}
                                                        isOpened={true}
                                                        isExportMode={true}
                                                        forceTrigger={true}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}
        </UserEditorLayout>
    );
};

export default UserEditorPage;
