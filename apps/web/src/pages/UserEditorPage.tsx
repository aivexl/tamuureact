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
// TUTORIAL SYSTEM (INDONESIAN - REFACTORED)
// ============================================

const TUTORIAL_STEPS = [
    {
        targetId: 'tutorial-info-card',
        title: 'Info Undangan',
        description: 'Kelola status publikasi dan bagikan link undangan Anda di sini.',
        position: 'bottom'
    },
    // Grid Items
    {
        targetId: 'tutorial-grid-item-music',
        title: 'Musik Latar',
        description: 'Pilih lagu romantis untuk mengiringi tamu saat membuka undangan.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-luckydraw',
        title: 'Undian / Doorprize',
        description: 'Buat acara makin seru dengan fitur undian berhadiah untuk tamu.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-template',
        title: 'Ganti Template',
        description: 'Ingin suasana baru? Anda bisa mengganti desain seluruh undangan di sini.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-guests',
        title: 'Manajemen Tamu',
        description: 'Kelola daftar nama tamu dan kirim link undangan personal via WhatsApp.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-wishes',
        title: 'Ucapan & Doa',
        description: 'Lihat dan kelola semua ucapan manis dari keluarga dan teman.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-display',
        title: 'Display TV',
        description: 'Atur tampilan layar besar/TV untuk di venue acara.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-location',
        title: 'Lokasi Acara',
        description: 'Atur koordinat Google Maps agar tamu tidak tersesat.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-gift',
        title: 'Kado Digital',
        description: 'Atur nomor rekening atau dompet digital untuk mempermudah tamu memberi kado.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-gallery',
        title: 'Galeri Foto',
        description: 'Unggah foto-foto pre-wedding terbaik Anda di sini.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-livestream',
        title: 'Live Streaming',
        description: 'Bagikan link siaran langsung acara Anda untuk tamu yang berhalangan hadir.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-analytics',
        title: 'Analitik Tamu',
        description: 'Pantau berapa banyak orang yang sudah membuka undangan Anda.',
        position: 'bottom'
    },
    {
        targetId: 'tutorial-grid-item-download',
        title: 'Download Aset',
        description: 'Unduh aset undangan dalam format gambar atau PDF.',
        position: 'bottom'
    },
    // Template Area
    {
        targetId: 'tutorial-template-area',
        title: 'Area Konten',
        description: 'Scroll ke bawah untuk mengedit teks dan gambar di setiap bagian undangan.',
        position: 'top'
    },
    {
        targetId: 'tutorial-section-expand',
        title: 'Edit Detail',
        description: 'Klik ikon ini untuk membuka formulir pengeditan bagian tersebut.',
        position: 'right'
    },
    {
        targetId: 'tutorial-section-visible',
        title: 'Atur Tampilan',
        description: 'Sembunyikan bagian yang tidak ingin Anda tampilkan sementara waktu.',
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
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                });
                
                // Ensure element is visible
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                // If dynamic element not found, skip to next
                if (step < TUTORIAL_STEPS.length - 1) setStep(s => s + 1);
                else onComplete();
            }
        };

        const timer = setTimeout(updateCoords, 300);
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

    // CALCULATE BEST POSITION TO AVOID VIEWPORT CLIPPING
    const getCardStyle = () => {
        const cardWidth = 280;
        const cardHeight = 180;
        const padding = 20;
        
        let top = 0;
        let left = 0;

        if (currentStep.position === 'bottom') {
            top = coords.top + coords.height + 15;
            left = coords.left + (coords.width / 2) - (cardWidth / 2);
        } else if (currentStep.position === 'top') {
            top = coords.top - cardHeight - 15;
            left = coords.left + (coords.width / 2) - (cardWidth / 2);
        } else if (currentStep.position === 'right') {
            top = coords.top + (coords.height / 2) - (cardHeight / 2);
            left = coords.left + coords.width + 15;
        } else if (currentStep.position === 'left') {
            top = coords.top + (coords.height / 2) - (cardHeight / 2);
            left = coords.left - cardWidth - 15;
        }

        // VIEWPORT CONSTRAINTS (Keep card inside screen)
        const minLeft = padding;
        const maxLeft = window.innerWidth - cardWidth - padding;
        const minTop = padding;
        const maxTop = window.innerHeight - cardHeight - padding;

        return {
            top: Math.max(minTop, Math.min(maxTop, top)),
            left: Math.max(minLeft, Math.min(maxLeft, left))
        };
    };

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* NO BACKDROP per user request */}

            {/* Tutorial Card */}
            <AnimatePresence mode="wait">
                <m.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        y: 0,
                        ...getCardStyle()
                    }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute w-[280px] bg-slate-900 text-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-5 pointer-events-auto border border-white/10 z-[101]"
                    style={{ position: 'absolute' }}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <button onClick={onComplete} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <h4 className="text-sm font-black tracking-tight mb-1 uppercase tracking-widest">{currentStep.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mb-5 font-medium">
                        {currentStep.description}
                    </p>

                    <div className="flex items-center justify-between">
                        <button 
                            onClick={onComplete}
                            className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors"
                        >
                            Lewati
                        </button>
                        
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-500">{step + 1} / {TUTORIAL_STEPS.length}</span>
                            <button
                                onClick={handleNext}
                                className="px-4 py-2 bg-white text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 transition-all active:scale-95"
                            >
                                {step === TUTORIAL_STEPS.length - 1 ? 'Selesai' : 'Lanjut'}
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    {/* Arrow Pointer */}
                    <m.div 
                        animate={{
                            rotate: 45,
                            x: currentStep.position === 'bottom' ? 0 : (currentStep.position === 'right' ? -5 : 0)
                        }}
                        className={`absolute w-3 h-3 bg-slate-900 border-white/10 ${
                            currentStep.position === 'bottom' ? '-top-1.5 left-1/2 -translate-x-1/2 border-t border-l' :
                            currentStep.position === 'top' ? '-bottom-1.5 left-1/2 -translate-x-1/2 border-b border-r' :
                            currentStep.position === 'right' ? 'top-1/2 -left-1.5 -translate-y-1/2 border-b border-l' :
                            'top-1/2 -right-1.5 -translate-y-1/2 border-t border-r'
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
